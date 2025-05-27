import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './App.css';
import { useNotification } from './Notification';

export default function MaintenanceRecords() {
    const [problem, setProblem] = useState('');
    const [serviceAt, setServiceAt] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const notify = useNotification();

    const fetchRecords = async () => {
        setLoading(true);
        setError('');
        const { data, error } = await supabase
            .from('maintenance_records')
            .select('*')
            .order('date', { ascending: false });
        if (error) setError(error.message);
        else setRecords(data);
        setLoading(false);
    };

    useEffect(() => { fetchRecords(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const user = (await supabase.auth.getUser()).data.user;
        const { error } = await supabase.from('maintenance_records').insert({
            user_id: user.id,
            problem,
            service_at: serviceAt,
            amount: parseFloat(amount),
            date,
        });
        if (error) {
            setError(error.message);
            notify(error.message, 'error');
        } else {
            notify('Maintenance record added', 'success');
        }
        setProblem('');
        setServiceAt('');
        setAmount('');
        setDate('');
        fetchRecords();
        setLoading(false);
    };

    return (
        <div style={{ maxWidth: '36rem', margin: '0 auto', padding: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Maintenance Records</h2>
            <form onSubmit={handleAdd} className="form-grid">
                <input
                    type="text"
                    placeholder="Problem"
                    value={problem}
                    onChange={e => setProblem(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Service Location"
                    value={serviceAt}
                    onChange={e => setServiceAt(e.target.value)}
                    required
                />
                <input
                    type="number"
                    step="0.01"
                    placeholder="Amount (RM)"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                />
                <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                />
                <button style={{ gridColumn: '1 / -1' }} disabled={loading}>
                    Add
                </button>
            </form>
            {error && <div style={{ color: '#e11d48', marginBottom: '0.5em' }}>{error}</div>}
            <div className="table-container">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Problem</th>
                            <th>Service Location</th>
                            <th>Amount (RM)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length === 0 && (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', color: '#888', padding: '1em' }}>No records</td>
                            </tr>
                        )}
                        {records.map((r) => (
                            <tr key={r.id}>
                                <td>{r.date}</td>
                                <td>{r.problem}</td>
                                <td>{r.service_at}</td>
                                <td>RM {Number(r.amount).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
