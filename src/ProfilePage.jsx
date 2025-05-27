import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './ProfilePage.css';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [resetEmailSent, setResetEmailSent] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data, error }) => {
            if (error) setError(error.message);
            else setUser(data.user);
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
    };

    if (!user) return <div className="profile-loading">Loading...</div>;

    // Helper for avatar
    const getInitial = (email) => email ? email[0].toUpperCase() : '?';

    return (
        <div className="profile-bg">
            <div className="profile-card">
                <div className="profile-avatar-section">
                    <div className="profile-avatar">{getInitial(user.email)}</div>
                    <h2 className="profile-title">Profile</h2>
                    <div className="profile-email">{user.email}</div>
                </div>
                <div className="profile-section">
                    <form onSubmit={handleChangePassword} className="profile-form">
                        <div className="profile-label">Change Password</div>
                        <input
                            type="password"
                            className="profile-input"
                            placeholder="New Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                        <button className="profile-btn profile-btn-blue" disabled={loading}>
                            {loading ? 'Changing...' : 'Change Password'}
                        </button>
                    </form>
                    <div>
                        <div className="profile-label">Reset Password</div>
                        <button
                            className="profile-btn profile-btn-yellow"
                            onClick={handleResetPassword}
                            disabled={loading || resetEmailSent}
                        >
                            {resetEmailSent ? 'Reset Email Sent' : 'Send Password Reset Email'}
                        </button>
                    </div>
                    {error && <div className="profile-error">{error}</div>}
                    {success && <div className="profile-success">{success}</div>}
                </div>
            </div>
        </div>
    );
}
