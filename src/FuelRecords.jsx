import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './App.css';
import { useNotification } from './Notification';

const FILTERS = [
    { label: '1 Month', value: '1m' },
    { label: '3 Months', value: '3m' },
    { label: '1 Year', value: '1y' },
    { label: 'All Time', value: 'all' },
];

function getDateFilter(value) {
    const now = new Date();
    if (value === '1m') now.setMonth(now.getMonth() - 1);
    else if (value === '3m') now.setMonth(now.getMonth() - 3);
    else if (value === '1y') now.setFullYear(now.getFullYear() - 1);
    else return null;
    return now.toISOString().slice(0, 10);
}

export default function FuelRecords() {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [records, setRecords] = useState([]);
    const [filter, setFilter] = useState('1m');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editId, setEditId] = useState(null);
    const [editAmount, setEditAmount] = useState('');
    const [editDate, setEditDate] = useState('');
    const notify = useNotification();

    const fetchRecords = React.useCallback(async () => {
        setLoading(true);
        setError('');
        let query = supabase.from('fuel_records').select('*').order('date', { ascending: false });
        const fromDate = getDateFilter(filter);
        if (fromDate) query = query.gte('date', fromDate);
        const { data, error } = await query;
        if (error) setError(error.message);
        else setRecords(data);
        setLoading(false);
    }, [filter]);

    useEffect(() => { fetchRecords(); }, [fetchRecords]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const user = (await supabase.auth.getUser()).data.user;
        const { error } = await supabase.from('fuel_records').insert({
            user_id: user.id,
            amount: parseFloat(amount),
            date,
        });
        if (error) {
            setError(error.message);
            notify(error.message, 'error');
        } else {
            notify('Fuel record added', 'success');
        }
        setAmount('');
        setDate('');
        fetchRecords();
        setLoading(false);
    };

    const handleEdit = (record) => {
        setEditId(record.id);
        setEditAmount(record.amount);
        setEditDate(record.date);
    };

    const handleEditSave = async (id) => {
        setLoading(true);
        setError('');
        const { error } = await supabase.from('fuel_records').update({
            amount: parseFloat(editAmount),
            date: editDate,
        }).eq('id', id);
        if (error) {
            setError(error.message);
            notify(error.message, 'error');
        } else {
            notify('Fuel record updated', 'success');
        }
        setEditId(null);
        setEditAmount('');
        setEditDate('');
        fetchRecords();
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this record?')) return;
        setLoading(true);
        setError('');
        const { error } = await supabase.from('fuel_records').delete().eq('id', id);
        if (error) {
            setError(error.message);
            notify(error.message, 'error');
        } else {
            notify('Fuel record deleted', 'success');
        }
        fetchRecords();
        setLoading(false);
    };

    const total = records.reduce((sum, r) => sum + Number(r.amount), 0);

    return (
        <div style={{ maxWidth: '36rem', margin: '0 auto', padding: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Fuel Records</h2>
            <form onSubmit={handleAdd} className="form-grid">
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
            <div style={{ marginBottom: '0.5em', display: 'flex', gap: '0.5em' }}>
                {FILTERS.map(f => (
                    <button
                        key={f.value}
                        className={filter === f.value ? '' : 'secondary'}
                        style={{ fontWeight: filter === f.value ? 'bold' : 'normal' }}
                        onClick={() => setFilter(f.value)}
                        type="button"
                    >
                        {f.label}
                    </button>
                ))}
            </div>
            <div style={{ marginBottom: '0.5em', textAlign: 'right', fontWeight: 600 }}>
                Total: RM {total.toFixed(2)}
            </div>
            {error && <div style={{ color: '#e11d48', marginBottom: '0.5em' }}>{error}</div>}
            <div className="table-container">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Amount (RM)</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length === 0 && (
                            <tr>
                                <td colSpan={3} style={{ textAlign: 'center', color: '#888', padding: '1em' }}>No records</td>
                            </tr>
                        )}
                        {records.map(r => (
                            <tr key={r.id}>
                                {editId === r.id ? (
                                    <>
                                        <td>
                                            <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
                                        </td>
                                        <td>
                                            <input type="number" step="0.01" value={editAmount} onChange={e => setEditAmount(e.target.value)} />
                                        </td>
                                        <td>
                                            <button onClick={() => handleEditSave(r.id)} disabled={loading}>Save</button>
                                            <button className="secondary" onClick={() => setEditId(null)} disabled={loading}>Cancel</button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{r.date}</td>
                                        <td>RM {Number(r.amount).toFixed(2)}</td>
                                        <td>
                                            <button className="secondary" onClick={() => handleEdit(r)}>Edit</button>
                                            <button style={{ marginLeft: 4 }} onClick={() => handleDelete(r.id)} disabled={loading}>Delete</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
