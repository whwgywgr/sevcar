import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNotification } from './useNotification';
import { Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, IconButton, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

// Simple in-memory cache for fetched records
const cache = {};

export default function MaintenanceRecords({ showAdd, setShowAdd }) {
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
        const user = (await supabase.auth.getUser()).data.user;
        const cacheKey = `${user.id}-maintenance`;
        if (cache[cacheKey]) {
            setRecords(cache[cacheKey]);
            setLoading(false);
            return;
        }
        const { data, error } = await supabase
            .from('maintenance_records')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });
        if (error) setError(error.message);
        else {
            setRecords(data);
            cache[cacheKey] = data;
        }
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
        // Invalidate cache after add
        delete cache[`${user.id}-maintenance`];
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
        const user = (await supabase.auth.getUser()).data.user;
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
        // Invalidate cache after edit
        delete cache[`${user.id}-maintenance`];
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this record?')) return;
        setLoading(true);
        setError('');
        const user = (await supabase.auth.getUser()).data.user;
        const { error } = await supabase.from('maintenance_records').delete().eq('id', id);
        if (error) {
            setError(error.message);
            notify(error.message, 'error');
        } else {
            notify('Maintenance record deleted', 'success');
        }
        fetchRecords();
        // Invalidate cache after delete
        delete cache[`${user.id}-maintenance`];
        setLoading(false);
    };

    return (
        <Box maxWidth={600} mx="auto" my={4} position="relative">
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h5" fontWeight={700}>Maintenance Records</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setShowAdd(true)}
                    sx={{ borderRadius: 2 }}
                >
                    Add
                </Button>
            </Box>
            <Dialog open={showAdd} onClose={() => setShowAdd(false)}>
                <DialogTitle>Add Maintenance Record</DialogTitle>
                <form onSubmit={handleAdd}>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Problem"
                            value={problem}
                            onChange={e => setProblem(e.target.value)}
                            required
                            autoFocus
                        />
                        <TextField
                            label="Service Location"
                            value={serviceAt}
                            onChange={e => setServiceAt(e.target.value)}
                            required
                        />
                        <TextField
                            label="Amount (RM)"
                            type="number"
                            inputProps={{ step: '0.01' }}
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            required
                        />
                        <TextField
                            label="Date"
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </DialogContent>
                    <DialogActions>
                        <Stack spacing={2} direction="row">
                            <Button onClick={() => setShowAdd(false)} color="secondary" variant="text">Cancel</Button>
                            <Button type="submit" variant="contained" disabled={loading}>Add</Button>
                        </Stack>
                    </DialogActions>
                </form>
            </Dialog>
            <Box sx={{ overflowX: 'auto', mb: 4 }}>
                <Table size="small" sx={{
                    width: 'auto',
                    tableLayout: 'auto',
                    borderCollapse: 'separate',
                    borderSpacing: 0,
                    '& th, & td': {
                        fontSize: '0.85rem',
                        px: 1,
                        py: 0.5,
                        borderBottom: '1px solid #333',
                        color: '#e0e0e0',
                        background: '#181a1b',
                        whiteSpace: 'nowrap',
                        maxWidth: 'none',
                    },
                    '& th': {
                        fontWeight: 700,
                        background: '#23272a',
                        color: '#fff',
                        borderBottom: '2px solid #444',
                    },
                    '& td': {
                        color: '#e0e0e0',
                        background: '#181a1b',
                    },
                }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Noted</TableCell>
                            <TableCell>Amount (RM)</TableCell>
                            <TableCell align="center">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {records.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ color: '#888', py: 2, fontSize: '0.85rem', background: '#181a1b' }}>No records</TableCell>
                            </TableRow>
                        )}
                        {records.map((r) => (
                            <TableRow
                                key={r.id}
                                hover
                                sx={{
                                    '&:hover': { background: '#23272a' },
                                    '&:last-child td': { borderBottom: 0 },
                                    height: 36,
                                }}
                            >
                                {editId === r.id ? (
                                    <>
                                        <TableCell sx={{ minWidth: 90 }}><TextField type="date" value={editDate} onChange={e => setEditDate(e.target.value)} size="small" InputLabelProps={{ shrink: true }} inputProps={{ style: { fontSize: '0.85rem', padding: 2, color: '#e0e0e0', background: '#23272a' } }} /></TableCell>
                                        <TableCell sx={{ minWidth: 180 }}>
                                            <Stack spacing={0.5}>
                                                <TextField value={editProblem} onChange={e => setEditProblem(e.target.value)} size="small" label="Problem" inputProps={{ style: { fontSize: '0.85rem', padding: 2, color: '#e0e0e0', background: '#23272a' } }} sx={{ mb: 0.5 }} />
                                                <TextField value={editServiceAt} onChange={e => setEditServiceAt(e.target.value)} size="small" label="Service Location" inputProps={{ style: { fontSize: '0.85rem', padding: 2, color: '#e0e0e0', background: '#23272a' } }} />
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={{ minWidth: 70 }}><TextField type="number" step="0.01" value={editAmount} onChange={e => setEditAmount(e.target.value)} size="small" inputProps={{ style: { fontSize: '0.85rem', padding: 2, color: '#e0e0e0', background: '#23272a' } }} /></TableCell>
                                        <TableCell align="center" sx={{ minWidth: 90 }}>
                                            <Stack direction="row" spacing={0.5} justifyContent="center">
                                                <Button onClick={() => handleEditSave(r.id)} disabled={loading} size="small" variant="contained" sx={{ minWidth: 0, px: 1, fontSize: '0.8rem' }}>Save</Button>
                                                <Button onClick={() => setEditId(null)} disabled={loading} size="small" color="secondary" variant="text" sx={{ minWidth: 0, px: 1, fontSize: '0.8rem' }}>Cancel</Button>
                                            </Stack>
                                        </TableCell>
                                    </>
                                ) : (
                                    <>
                                        <TableCell sx={{ minWidth: 90 }}>{new Date(r.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</TableCell>
                                        <TableCell sx={{ minWidth: 180, whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>
                                            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.25, fontSize: '0.85rem', lineHeight: 1.2, color: '#fff' }}>{r.problem}</Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', lineHeight: 1.1, color: '#b0b0b0' }}>{r.service_at}</Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'right' }}>{Number(r.amount).toFixed(2)}</TableCell>
                                        <TableCell align="center" sx={{ minWidth: 90 }}>
                                            <Stack direction="row" spacing={0.5} justifyContent="center">
                                                <IconButton onClick={() => handleEdit(r)} size="small" color="primary" sx={{ p: 0.5 }}><EditIcon fontSize="small" /></IconButton>
                                                <IconButton onClick={() => handleDelete(r.id)} disabled={loading} size="small" color="error" sx={{ p: 0.5 }}><DeleteIcon fontSize="small" /></IconButton>
                                            </Stack>
                                        </TableCell>
                                    </>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
            {error && <Box color="error.main" mb={1}>{error}</Box>}
            {loading && <CircularProgress size={32} sx={{ position: 'absolute', top: 16, right: 16 }} />}
        </Box>
    );
}
