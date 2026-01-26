import React, { useMemo, useState } from 'react';
import { Box, Button, Paper, TextField, Typography, Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const login = useAuthStore((s) => s.login);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const redirectTo = useMemo(() => {
        const state = location.state as any;
        return state?.from ?? '/admin';
    }, [location.state]);

    const validate = () => {
        let hasError = false;
        setEmailError(null);
        setPasswordError(null);

        if (!email.trim()) {
            setEmailError('Email is required');
            hasError = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setEmailError('Enter a valid email address');
            hasError = true;
        }

        if (!password) {
            setPasswordError('Password is required');
            hasError = true;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            hasError = true;
        }

        return !hasError;
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await login(email, password);
            navigate(redirectTo, { replace: true });
        } catch (err: any) {
            // Prefer backend validation / auth message when available
            setError(err?.message ?? 'Login failed. Please check your credentials and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
            <Paper sx={{ width: '100%', maxWidth: 420, p: 4 }}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                    Livemo Admin
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Sign in with your admin account.
                </Typography>

                {error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                ) : null}

                <Box component="form" onSubmit={onSubmit}>
                    <TextField
                        label="Email"
                        type="email"
                        fullWidth
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (emailError) {
                                setEmailError(null);
                            }
                        }}
                        error={!!emailError}
                        helperText={emailError ?? ''}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (passwordError) {
                                setPasswordError(null);
                            }
                        }}
                        error={!!passwordError}
                        helperText={passwordError ?? ''}
                        sx={{ mb: 3 }}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading}
                    >
                        {loading ? 'Signing in…' : 'Sign In'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default Login;
