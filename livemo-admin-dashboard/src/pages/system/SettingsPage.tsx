import { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Divider,
    FormControlLabel,
    Paper,
    Stack,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import { Refresh as RefreshIcon, Save as SaveIcon } from '@mui/icons-material';
import { getAdminSettingsApi, updateAdminSettings } from '../../api/admin';
import type { AdminSettings } from '../../api/admin';
import { useAuthStore } from '../../stores/authStore';

const SettingsPage = () => {
    const token = useAuthStore((s) => s.token);
    const [settings, setSettings] = useState<AdminSettings | null>(null);
    const [form, setForm] = useState({ site_name: '', commission_rate: '', maintenance_mode: false });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const syncForm = (data: AdminSettings) => {
        setSettings(data);
        setForm({
            site_name: String(data.site_name ?? ''),
            commission_rate: data.commission_rate != null ? String(data.commission_rate * 100) : '',
            maintenance_mode: Boolean(data.maintenance_mode),
        });
    };

    const loadSettings = async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const response = await getAdminSettingsApi(token);
            syncForm(response);
        } catch (err: any) {
            setError(err?.message ?? 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const handleSave = async () => {
        if (!token) return;
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            const payload = {
                site_name: form.site_name,
                maintenance_mode: form.maintenance_mode,
                commission_rate: form.commission_rate ? Number(form.commission_rate) / 100 : undefined,
            };
            await updateAdminSettings(token, payload);
            setSuccess('Settings updated');
            await loadSettings();
        } catch (err: any) {
            setError(err?.message ?? 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} sx={{ mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">
                        Platform Settings
                    </Typography>
                    <Typography color="text.secondary">Control the administrative knobs for Livemo.</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadSettings} disabled={loading || saving}>
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={saving || loading || !form.site_name}
                    >
                        {saving ? 'Saving…' : 'Save changes'}
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

            <Paper sx={{ p: 3 }}>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Brand
                        </Typography>
                        <TextField
                            label="Site name"
                            value={form.site_name}
                            onChange={(event) => setForm((prev) => ({ ...prev, site_name: event.target.value }))}
                            fullWidth
                            disabled={loading}
                        />
                    </Box>

                    <Divider />

                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Financial
                        </Typography>
                        <TextField
                            label="Commission rate"
                            type="number"
                            value={form.commission_rate}
                            onChange={(event) => setForm((prev) => ({ ...prev, commission_rate: event.target.value }))}
                            InputProps={{ endAdornment: <span style={{ color: '#888' }}>%</span> }}
                            helperText="Percent fee kept from transactions"
                            fullWidth
                            disabled={loading}
                        />
                    </Box>

                    <Divider />

                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            Maintenance
                        </Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={form.maintenance_mode}
                                    onChange={(_, checked) => setForm((prev) => ({ ...prev, maintenance_mode: checked }))}
                                    color="primary"
                                    disabled={loading}
                                />
                            }
                            label="Enable maintenance mode"
                        />
                        <Typography variant="body2" color="text.secondary">
                            When enabled, end-users will see a maintenance banner across the marketplace.
                        </Typography>
                    </Box>
                </Stack>
            </Paper>
        </Box>
    );
};

export default SettingsPage;
