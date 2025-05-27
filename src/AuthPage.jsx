import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNotification } from './Notification';

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-sm p-6 bg-white rounded shadow">
                <h2 className="text-2xl font-bold mb-4 text-center">
                    {isLogin ? 'Login' : 'Register'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <input
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <button
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <button
                        className="text-blue-600 hover:underline text-sm"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? 'No account? Register' : 'Have an account? Login'}
                    </button>
                </div>
            </div>
        </div>
    );
}
