import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNotification } from './Notification';
import './AuthPage.css';

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
        <div className="auth-bg">
            <div className="auth-card">
                <div className="auth-logo" aria-label="Car Logo">🚗</div>
                <h2 className="auth-title">
                    {isLogin ? 'Login' : 'Register'}
                </h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        className="auth-input"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <input
                        className="auth-input"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    {error && <div className="auth-error">{error}</div>}
                    <button
                        className="auth-btn"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
                    </button>
                </form>
                <button
                    className="auth-toggle"
                    onClick={() => setIsLogin(!isLogin)}
                >
                    {isLogin ? 'No account? Register' : 'Have an account? Login'}
                </button>
            </div>
        </div>
    );
}
