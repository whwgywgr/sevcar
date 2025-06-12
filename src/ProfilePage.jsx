import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Typography, Avatar, TextField, Button, CircularProgress, Alert, Divider, IconButton, InputAdornment, Snackbar, Box } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import LockResetIcon from '@mui/icons-material/LockReset';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Simple in-memory cache for profile data
const profileCache = {};

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        const cacheKey = `profile-${user?.id || ''}`;
        if (profileCache[cacheKey]) {
            setUser(profileCache[cacheKey]);
            return;
        }
        supabase.auth.getUser().then(({ data, error }) => {
            if (error) setError(error.message);
            else {
                setUser(data.user);
                profileCache[cacheKey] = data.user;
            }
        });
    }, [user?.id]);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        const { error } = await supabase.auth.updateUser({ password });
        setLoading(false);
        if (error) {
            setError(error.message);
            setSnackbar({ open: true, message: error.message, severity: 'error' });
        } else {
            setSuccess('Password updated successfully.');
            setSnackbar({ open: true, message: 'Password updated successfully.', severity: 'success' });
        }
        setPassword('');
        // Invalidate cache after password change
        delete profileCache[`profile-${user?.id || ''}`];
    };

    const handleResetPassword = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            redirectTo: window.location.origin,
        });
        setLoading(false);
        if (error) {
            setError(error.message);
            setSnackbar({ open: true, message: error.message, severity: 'error' });
        } else {
            setResetEmailSent(true);
            setSnackbar({ open: true, message: 'Reset email sent!', severity: 'success' });
        }
        // Invalidate cache after reset
        delete profileCache[`profile-${user?.id || ''}`];
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

    if (!user) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <CircularProgress />
        </Box>
    );

    // Helper for avatar
    const getInitial = (email) => email ? email[0].toUpperCase() : '?';

    return (
        <Box
            sx={{
                maxWidth: 400,
                mx: 'auto',
                mt: 8,
                p: 4,
                bgcolor: 'background.paper',
                borderRadius: 3,
                boxShadow: 3,
                position: 'relative',
            }}
        >
            <IconButton onClick={handleLogout} sx={{ position: 'absolute', top: 16, right: 16, color: 'grey.700' }} title="Log Out">
                <LogoutIcon />
            </IconButton>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', color: 'white', width: 96, height: 96, fontSize: 48, mb: 2, border: '4px solid #fff', boxShadow: 2 }}>{getInitial(user.email)}</Avatar>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>Profile</Typography>
                <Typography color="text.secondary" sx={{ opacity: 0.9 }}>{user.email}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box>
                <form onSubmit={handleChangePassword} style={{ marginBottom: 16 }}>
                    <Typography fontWeight={600} display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}><VpnKeyIcon fontSize="small" /> Change Password</Typography>
                    <TextField
                        type={showPassword ? 'text' : 'password'}
                        label="New Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        fullWidth
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowPassword((show) => !show)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        helperText="Password must be at least 6 characters."
                        sx={{ mb: 2 }}
                    />
                    <Button type="submit" variant="contained" disabled={loading || !password} size="large" fullWidth>
                        {loading ? 'Changing...' : 'Change Password'}
                    </Button>
                </form>
                <Divider sx={{ my: 2 }}>or</Divider>
                <Box>
                    <Typography fontWeight={600} display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}><LockResetIcon fontSize="small" /> Reset Password</Typography>
                    <Button
                        variant="outlined"
                        color="warning"
                        onClick={handleResetPassword}
                        disabled={loading || resetEmailSent}
                        fullWidth
                        size="large"
                    >
                        {resetEmailSent ? 'Reset Email Sent' : 'Send Password Reset Email'}
                    </Button>
                </Box>
                {(error || success) && (
                    <Box sx={{ mt: 2 }}>
                        {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ mb: 1 }}>{success}</Alert>}
                    </Box>
                )}
            </Box>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
