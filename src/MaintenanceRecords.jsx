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
    const [editId, setEditId] = useState(null);
    const [editProblem, setEditProblem] = useState('');
    const [editServiceAt, setEditServiceAt] = useState('');
    const [editAmount, setEditAmount] = useState('');
    const [editDate, setEditDate] = useState('');
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

    const handleEdit = (record) => {
        setEditId(record.id);
        setEditProblem(record.problem);
        setEditServiceAt(record.service_at);
        setEditAmount(record.amount);
        setEditDate(record.date);
    };

    const handleEditSave = async (id) => {
        setLoading(true);
        setError('');
        const { error } = await supabase.from('maintenance_records').update({
            problem: editProblem,
            service_at: editServiceAt,
            amount: parseFloat(editAmount),
            date: editDate,
        }).eq('id', id);
        if (error) {
            setError(error.message);
            notify(error.message, 'error');
        } else {
            notify('Maintenance record updated', 'success');
        }
        setEditId(null);
        setEditProblem('');
        setEditServiceAt('');
        setEditAmount('');
        setEditDate('');
        fetchRecords();
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this record?')) return;
        setLoading(true);
        setError('');
        const { error } = await supabase.from('maintenance_records').delete().eq('id', id);
        if (error) {
            setError(error.message);
            notify(error.message, 'error');
        } else {
            notify('Maintenance record deleted', 'success');
        }
        fetchRecords();
        setLoading(false);
    };

    return (
        <div>
            <h2>Maintenance Records</h2>
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
                <button disabled={loading}>
                    Add
                </button>
            </form>
            {error && <div>{error}</div>}
            <div>
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Problem</th>
                            <th>Service Location</th>
                            <th>Amount (RM)</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length === 0 && (
                            <tr>
                                <td colSpan={5}>No records</td>
                            </tr>
                        )}
                        {records.map((r) => (
                            <tr key={r.id}>
                                {editId === r.id ? (
                                    <>
                                        <td><input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} /></td>
                                        <td><input type="text" value={editProblem} onChange={e => setEditProblem(e.target.value)} /></td>
                                        <td><input type="text" value={editServiceAt} onChange={e => setEditServiceAt(e.target.value)} /></td>
                                        <td><input type="number" step="0.01" value={editAmount} onChange={e => setEditAmount(e.target.value)} /></td>
                                        <td>
                                            <button onClick={() => handleEditSave(r.id)} disabled={loading}>Save</button>
                                            <button className="secondary" onClick={() => setEditId(null)} disabled={loading}>Cancel</button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{r.date}</td>
                                        <td>{r.problem}</td>
                                        <td>{r.service_at}</td>
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
