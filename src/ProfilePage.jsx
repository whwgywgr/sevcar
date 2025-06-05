import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Box, Card, CardContent, Typography, Avatar, TextField, Button, CircularProgress, Alert } from '@mui/material';

// Simple in-memory cache for profile data
const profileCache = {};

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [resetEmailSent, setResetEmailSent] = useState(false);

    useEffect(() => {
        const cacheKey = 'profile';
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
    }, []);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        const { error } = await supabase.auth.updateUser({ password });
        setLoading(false);
        if (error) setError(error.message);
        else setSuccess('Password updated successfully.');
        setPassword('');
        // Invalidate cache after password change
        delete profileCache['profile'];
    };

    const handleResetPassword = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            redirectTo: window.location.origin,
        });
        setLoading(false);
        if (error) setError(error.message);
        else setResetEmailSent(true);
        // Invalidate cache after reset
        delete profileCache['profile'];
    };

    if (!user) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;

    // Helper for avatar
    const getInitial = (email) => email ? email[0].toUpperCase() : '?';

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <Card sx={{ maxWidth: 400, width: '100%', p: 3 }}>
                <CardContent>
                    <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 80, height: 80, fontSize: 36, mb: 1 }}>{getInitial(user.email)}</Avatar>
                        <Typography variant="h6" fontWeight={700}>Profile</Typography>
                        <Typography color="text.secondary">{user.email}</Typography>
                    </Box>
                    <Box component="form" onSubmit={handleChangePassword} mb={2} display="flex" flexDirection="column" gap={2}>
                        <Typography fontWeight={600}>Change Password</Typography>
                        <TextField
                            type="password"
                            label="New Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? 'Changing...' : 'Change Password'}
                        </Button>
                    </Box>
                    <Box mb={2}>
                        <Typography fontWeight={600}>Reset Password</Typography>
                        <Button
                            variant="contained"
                            color="warning"
                            onClick={handleResetPassword}
                            disabled={loading || resetEmailSent}
                        >
                            {resetEmailSent ? 'Reset Email Sent' : 'Send Password Reset Email'}
                        </Button>
                    </Box>
                    {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 1 }}>{success}</Alert>}
                </CardContent>
            </Card>
        </Box>
    );
}
