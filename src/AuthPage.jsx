import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNotification } from './Notification';
import { Box, Card, CardContent, Typography, TextField, Button, CircularProgress, Alert, IconButton } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

export default function AuthPage({ onAuth }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const notify = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        let result;
        if (isLogin) {
            result = await supabase.auth.signInWithPassword({ email, password });
        } else {
            result = await supabase.auth.signUp({ email, password });
        }
        setLoading(false);
        if (result.error) {
            setError(result.error.message);
            notify(result.error.message, 'error');
        } else if (result.data.session || result.data.user) {
            onAuth();
            notify(isLogin ? 'Login successful' : 'Registration successful', 'success');
        } else {
            setError('Check your email for confirmation.');
            notify('Check your email for confirmation.', 'info');
        }
    };

    return (
        <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="#e0e7ff">
            <Card sx={{ maxWidth: 370, width: '100%', p: 3 }}>
                <CardContent>
                    <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                        <DirectionsCarIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h6" fontWeight={700} mb={1}>{isLogin ? 'Login' : 'Register'}</Typography>
                    </Box>
                    <form onSubmit={handleSubmit}>
                        <Box display="flex" flexDirection="column" gap={2} mb={2}>
                            <TextField
                                label="Email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoFocus
                            />
                            <TextField
                                label="Password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                            {error && <Alert severity="error">{error}</Alert>}
                            <Button type="submit" variant="contained" disabled={loading}>
                                {loading ? <CircularProgress size={22} /> : isLogin ? 'Login' : 'Register'}
                            </Button>
                        </Box>
                    </form>
                    <Button
                        color="primary"
                        onClick={() => setIsLogin(!isLogin)}
                        sx={{ textTransform: 'none', mt: 1 }}
                    >
                        {isLogin ? 'No account? Register' : 'Have an account? Login'}
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
}
