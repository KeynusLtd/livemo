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
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Refresh as RefreshIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import {
    createAdminAnimalCatalog,
    deleteAdminAnimalCatalog,
    getAdminAnimalCatalogs,
    updateAdminAnimalCatalog,
} from '../../api/admin';
import type { AdminAnimalCatalog } from '../../api/admin';
import { useAuthStore } from '../../stores/authStore';

const typeOptions = [
    { label: 'All types', value: 'all' },
    { label: 'Cattle', value: 'cattle' },
    { label: 'Goats', value: 'goats' },
    { label: 'Sheep', value: 'sheep' },
    { label: 'Poultry', value: 'poultry' },
    { label: 'Swine', value: 'swine' },
    { label: 'Horses', value: 'horses' },
    { label: 'Rabbits', value: 'rabbits' },
];

const statusOptions = [
    { label: 'All statuses', value: 'all' },
    { label: 'Active', value: '1' },
    { label: 'Inactive', value: '0' },
];

const emptyForm: Omit<AdminAnimalCatalog, 'id' | 'created_at'> & { id?: number } = {
    id: undefined,
    name: '',
    type: 'cattle',
    breed: '',
    default_gender: null,
    is_active: true,
    metadata: undefined,
    created_by: null,
    updated_at: undefined,
};

export default function AnimalCatalogsPage() {
    const token = useAuthStore((s) => s.token);

    const [items, setItems] = useState<AdminAnimalCatalog[]>([]);
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

    const typeCounts = useMemo(() => {
        const counts = new Map<string, number>();
        for (const item of items) {
            const t = (item.type ?? '').trim();
            if (!t) continue;
            counts.set(t, (counts.get(t) ?? 0) + 1);
        }
        return Array.from(counts.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([type, count]) => ({ type, count }));
    }, [items]);

    const dynamicTypeOptions = useMemo(() => {
        const labelFor = (t: string) => {
            const fromBase = typeOptions.find((o) => o.value === t)?.label;
            return fromBase ?? t;
        };

        const base = typeOptions;
        const baseValues = new Set(base.map((o) => o.value));
        const fromItems = typeCounts
            .map((t) => t.type)
            .filter((t) => !baseValues.has(t))
            .map((t) => ({ label: labelFor(t), value: t }));

        const ensureCurrentFilter =
            typeFilter !== 'all' && !baseValues.has(typeFilter) && !fromItems.some((o) => o.value === typeFilter)
                ? [{ label: labelFor(typeFilter), value: typeFilter }]
                : [];

        return [base[0], ...ensureCurrentFilter, ...base.slice(1), ...fromItems];
    }, [typeCounts, typeFilter]);

    const loadItems = async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const response = await getAdminAnimalCatalogs(token, {
                page,
                per_page: 200,
                type: typeFilter === 'all' ? undefined : typeFilter,
                is_active: statusFilter === 'all' ? undefined : statusFilter,
                search: search.trim() || undefined,
            });
            setItems(response.data);
            setTotal(response.total);
            setPerPage(response.per_page);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to load catalog animals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, page, typeFilter, statusFilter, search]);

    const openCreate = () => {
        setSuccess(null);
        setError(null);
        setFormState(emptyForm);
        setDrawerOpen(true);
    };

    const openEdit = (item: AdminAnimalCatalog) => {
        setSuccess(null);
        setError(null);
        setFormState({
            ...emptyForm,
            id: item.id,
            name: item.name,
            type: item.type,
            breed: item.breed ?? '',
            default_gender: item.default_gender ?? null,
            is_active: item.is_active,
            metadata: item.metadata,
            created_by: item.created_by ?? null,
            updated_at: item.updated_at,
        });
        setDrawerOpen(true);
    };

    const submitForm = async () => {
        if (!token) return;
        setFormSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const payload: Partial<AdminAnimalCatalog> = {
                name: formState.name,
                type: formState.type,
                breed: formState.breed?.trim() ? formState.breed.trim() : null,
                default_gender: formState.default_gender ?? null,
                is_active: formState.is_active,
            };

            if (formState.id) {
                await updateAdminAnimalCatalog(token, formState.id, payload);
                setSuccess('Catalog animal updated');
            } else {
                await createAdminAnimalCatalog(token, payload);
                setSuccess('Catalog animal created');
            }

            setDrawerOpen(false);
            await loadItems();
        } catch (err: any) {
            setError(err?.message ?? 'Failed to save');
        } finally {
            setFormSubmitting(false);
        }
    };

    const removeItem = async (id: number) => {
        if (!token) return;
        if (!confirm('Delete this catalog animal?')) return;

        setError(null);
        setSuccess(null);
        try {
            await deleteAdminAnimalCatalog(token, id);
            setSuccess('Deleted');
            await loadItems();
        } catch (err: any) {
            setError(err?.message ?? 'Failed to delete');
        }
    };

    const onTypeFilterChange = (e: SelectChangeEvent) => {
        setPage(1);
        setTypeFilter(e.target.value);
    };

    const onStatusFilterChange = (e: SelectChangeEvent) => {
        setPage(1);
        setStatusFilter(e.target.value);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        Animal Catalog
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Admin uploaded animals. Farmers can only select from this list.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={() => loadItems()}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
                        Add
                    </Button>
                </Stack>
            </Stack>

            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid xs={12} md={4}>
                        <TextField
                            value={search}
                            onChange={(e) => {
                                setPage(1);
                                setSearch(e.target.value);
                            }}
                            fullWidth
                            label="Search"
                            placeholder="Search by name or breed"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Type</InputLabel>
                            <Select label="Type" value={typeFilter} onChange={onTypeFilterChange}>
                                {dynamicTypeOptions.map((o) => (
                                    <MenuItem key={o.value} value={o.value}>
                                        {o.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select label="Status" value={statusFilter} onChange={onStatusFilterChange}>
                                {statusOptions.map((o) => (
                                    <MenuItem key={o.value} value={o.value}>
                                        {o.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    Animal Types in Catalog
                </Typography>
                {typeCounts.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        No types found.
                    </Typography>
                ) : (
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        {typeCounts.map(({ type, count }) => (
                            <Chip
                                key={type}
                                label={`${type} (${count})`}
                                variant={typeFilter === type ? 'filled' : 'outlined'}
                                onClick={() => {
                                    setPage(1);
                                    setTypeFilter(type);
                                }}
                            />
                        ))}
                    </Stack>
                )}
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            <Paper sx={{ p: 2 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Breed</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {items.map((item) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell>{item.id}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>
                                            <Chip size="small" label={item.type} />
                                        </TableCell>
                                        <TableCell>{item.breed ?? '-'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                color={item.is_active ? 'success' : 'default'}
                                                label={item.is_active ? 'Active' : 'Inactive'}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Edit">
                                                <IconButton onClick={() => openEdit(item)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton onClick={() => removeItem(item.id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {items.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <Box sx={{ py: 5, textAlign: 'center', color: 'text.secondary' }}>
                                                No catalog animals found.
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        <Divider sx={{ my: 2 }} />

                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                                Page {page} of {pageCount}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    disabled={page >= pageCount}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Next
                                </Button>
                            </Stack>
                        </Stack>
                    </>
                )}
            </Paper>

            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Box sx={{ width: 420, p: 3 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6" fontWeight={700}>
                            {formState.id ? 'Edit catalog animal' : 'Add catalog animal'}
                        </Typography>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Stack spacing={2}>
                        <TextField
                            label="Name"
                            value={formState.name}
                            onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                            fullWidth
                        />

                        <FormControl fullWidth>
                            <InputLabel>Type</InputLabel>
                            <Select
                                label="Type"
                                value={formState.type}
                                onChange={(e) =>
                                    setFormState((s) => ({
                                        ...s,
                                        type: e.target.value as AdminAnimalCatalog['type'],
                                    }))
                                }
                            >
                                {typeOptions
                                    .filter((o) => o.value !== 'all')
                                    .map((o) => (
                                        <MenuItem key={o.value} value={o.value}>
                                            {o.label}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Breed (optional)"
                            value={formState.breed ?? ''}
                            onChange={(e) => setFormState((s) => ({ ...s, breed: e.target.value }))}
                            fullWidth
                        />

                        <FormControl fullWidth>
                            <InputLabel>Default Gender</InputLabel>
                            <Select
                                label="Default Gender"
                                value={formState.default_gender ?? ''}
                                onChange={(e) =>
                                    setFormState((s) => ({
                                        ...s,
                                        default_gender: (e.target.value || null) as AdminAnimalCatalog['default_gender'],
                                    }))
                                }
                            >
                                <MenuItem value="">Not set</MenuItem>
                                <MenuItem value="female">Female</MenuItem>
                                <MenuItem value="male">Male</MenuItem>
                            </Select>
                        </FormControl>

                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="body2">Active</Typography>
                            <Switch
                                checked={Boolean(formState.is_active)}
                                onChange={(e) => setFormState((s) => ({ ...s, is_active: e.target.checked }))}
                            />
                        </Stack>

                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button variant="outlined" onClick={() => setDrawerOpen(false)} disabled={formSubmitting}>
                                Cancel
                            </Button>
                            <Button variant="contained" onClick={submitForm} disabled={formSubmitting || !formState.name.trim()}>
                                {formSubmitting ? 'Saving...' : 'Save'}
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </Drawer>
        </Box>
    );
}
