import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNotification } from './useNotification';
import { Box, Typography, Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, IconButton, Stack, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

// Simple in-memory cache for fetched records
const cache = {};

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
    const [filterMonth, setFilterMonth] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [search, setSearch] = useState('');
    const notify = useNotification();

    const months = [
        '', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const years = Array.from(new Set(records.map(r => new Date(r.date).getFullYear())));
    years.sort((a, b) => b - a);

    const filteredRecords = records.filter(r => {
        const d = new Date(r.date);
        const searchLower = search.trim().toLowerCase();
        // Search logic
        if (searchLower) {
            const dateStr = d.toLocaleDateString('en-GB');
            const monthStr = d.toLocaleString('en-US', { month: 'long' }).toLowerCase();
            const yearStr = d.getFullYear().toString();
            const problemStr = (r.problem || '').toLowerCase();
            const serviceStr = (r.service_at || '').toLowerCase();
            const amountStr = Number(r.amount).toFixed(2);
            if (
                dateStr.includes(searchLower) ||
                monthStr.includes(searchLower) ||
                yearStr.includes(searchLower) ||
                problemStr.includes(searchLower) ||
                serviceStr.includes(searchLower) ||
                amountStr.includes(searchLower)
            ) {
                // pass
            } else {
                return false;
            }
        }
        if (filterMonth === 'all' && filterYear) {
            return d.getFullYear().toString() === filterYear;
        }
        const matchMonth = filterMonth ? d.getMonth() + 1 === months.indexOf(filterMonth) : true;
        const matchYear = filterYear ? d.getFullYear().toString() === filterYear : true;
        return matchMonth && matchYear;
    });

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
        <Box maxWidth={1000} mx="auto" my={4} position="relative">
            <Grid container spacing={4}>
                <Grid item xs={12} md={5}>
                    <Box sx={{ p: 3, borderRadius: 2, background: '#fafafa' }}>
                        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                            <TextField
                                select
                                label="Month"
                                size="small"
                                value={filterMonth}
                                onChange={e => setFilterMonth(e.target.value)}
                                SelectProps={{ native: true }}
                                sx={{ minWidth: 110 }}
                            >
                                <option value=""> </option>
                                <option value="all">All Month</option>
                                {months.slice(1).map((m, i) => (
                                    <option key={i + 1} value={m}>{m}</option>
                                ))}
                            </TextField>
                            <TextField
                                select
                                label="Year"
                                size="small"
                                value={filterYear}
                                onChange={e => setFilterYear(e.target.value)}
                                SelectProps={{ native: true }}
                                sx={{ minWidth: 90 }}
                            >
                                <option value=""> </option>
                                {years.map((y, i) => (
                                    <option key={i} value={y}>{y}</option>
                                ))}
                            </TextField>
                        </Box>
                        <Box sx={{ mb: 3 }}>
                            <Paper elevation={2} sx={{ p: 2, borderRadius: 2, background: '#e3f2fd', display: 'inline-block', minWidth: 220 }}>
                                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600, letterSpacing: 1 }}>TOTAL MAINTENANCE</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2', mt: 1, mb: 0.5 }}>
                                    RM {filteredRecords.reduce((sum, r) => sum + Number(r.amount), 0).toFixed(2)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">Sum of maintenance costs {filterMonth || filterYear ? 'for selected period' : 'for all time'}</Typography>
                            </Paper>
                        </Box>
                        <Typography variant="h6" fontWeight={700} mb={2}>Add Maintenance Record</Typography>
                        <form onSubmit={handleAdd}>
                            <Stack spacing={2}>
                                <TextField
                                    label="Problem"
                                    value={problem}
                                    onChange={e => setProblem(e.target.value)}
                                    required
                                    autoFocus
                                    inputProps={{ style: { textTransform: 'capitalize' } }}
                                />
                                <TextField
                                    label="Service Location"
                                    value={serviceAt}
                                    onChange={e => setServiceAt(e.target.value)}
                                    required
                                    inputProps={{ style: { textTransform: 'capitalize' } }}
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
                                <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={loading}>Add</Button>
                            </Stack>
                        </form>
                        {error && <Box color="error.main" mt={2}>{error}</Box>}
                    </Box>
                </Grid>
                <Grid item xs={12} md={7}>
                    <Box>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                            <Typography variant="h5" fontWeight={700}>Maintenance Records</Typography>
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <TextField
                                    label="Search"
                                    size="small"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Date, month, year, problem, service, amount..."
                                    sx={{ minWidth: 220 }}
                                />
                            </Box>
                        </Box>
                        <Box sx={{ overflowX: 'auto', mb: 4 }}>
                            <TableContainer component={Paper} sx={{ boxShadow: 'none', borderRadius: 0 }}>
                                <Table size="small" sx={{ minWidth: 320, width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, background: '#fff', color: '#000' }}>Date</TableCell>
                                            <TableCell sx={{ fontWeight: 700, background: '#fff', color: '#000' }}>Noted</TableCell>
                                            <TableCell sx={{ fontWeight: 700, background: '#fff', color: '#000' }}>Amount (RM)</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 700, background: '#fff', color: '#000' }}>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {records.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ color: '#888', py: 2, fontSize: '0.95rem', background: '#fff' }}>No records</TableCell>
                                            </TableRow>
                                        )}
                                        {records.map((r) => (
                                            <TableRow key={r.id} sx={{ background: '#fff', '&:last-child td': { borderBottom: 0 }, height: 36 }}>
                                                {editId === r.id ? (
                                                    <>
                                                        <TableCell sx={{ minWidth: 90 }}><TextField type="date" value={editDate} onChange={e => setEditDate(e.target.value)} size="small" InputLabelProps={{ shrink: true }} inputProps={{ style: { fontSize: '0.95rem', padding: 2, color: '#000', background: '#fff' } }} /></TableCell>
                                                        <TableCell sx={{ minWidth: 180 }}>
                                                            <Stack spacing={0.5}>
                                                                <TextField value={editProblem} onChange={e => setEditProblem(e.target.value)} size="small" label="Problem" inputProps={{ style: { fontSize: '0.95rem', padding: 2, color: '#000', background: '#fff', textTransform: 'capitalize' } }} sx={{ mb: 0.5 }} />
                                                                <TextField value={editServiceAt} onChange={e => setEditServiceAt(e.target.value)} size="small" label="Service Location" inputProps={{ style: { fontSize: '0.95rem', padding: 2, color: '#000', background: '#fff', textTransform: 'capitalize' } }} />
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell sx={{ minWidth: 70 }}><TextField type="number" step="0.01" value={editAmount} onChange={e => setEditAmount(e.target.value)} size="small" inputProps={{ style: { fontSize: '0.95rem', padding: 2, color: '#000', background: '#fff' } }} /></TableCell>
                                                        <TableCell align="center" sx={{ minWidth: 90 }}>
                                                            <Stack direction="row" spacing={0.5} justifyContent="center">
                                                                <Button onClick={() => handleEditSave(r.id)} disabled={loading} size="small" variant="contained" sx={{ minWidth: 0, px: 1, fontSize: '0.85rem' }}>Save</Button>
                                                                <Button onClick={() => setEditId(null)} disabled={loading} size="small" color="secondary" variant="text" sx={{ minWidth: 0, px: 1, fontSize: '0.85rem' }}>Cancel</Button>
                                                            </Stack>
                                                        </TableCell>
                                                    </>
                                                ) : (
                                                    <>
                                                        <TableCell sx={{ minWidth: 90 }}>
                                                            {(() => {
                                                                const d = new Date(r.date);
                                                                const day = d.getDate().toString().padStart(2, '0');
                                                                const month = d.toLocaleString('en-US', { month: 'long' }).toUpperCase();
                                                                const year = d.getFullYear();
                                                                return (
                                                                    <Box textAlign="center" lineHeight={1}>
                                                                        <Typography component="div" sx={{ fontSize: 32, fontWeight: 400, lineHeight: 1, letterSpacing: 0 }}>{day}</Typography>
                                                                        <Typography component="div" sx={{ fontSize: 14, fontWeight: 400, letterSpacing: 1, mt: '-2px' }}>{month}</Typography>
                                                                        <Typography component="div" sx={{ fontSize: 16, fontWeight: 300, color: '#222', mt: '-2px' }}>{year}</Typography>
                                                                    </Box>
                                                                );
                                                            })()}
                                                        </TableCell>
                                                        <TableCell sx={{ minWidth: 180, whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>
                                                            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.25, fontSize: '0.95rem', lineHeight: 1.2, color: '#000', textTransform: 'capitalize' }}>{r.problem}</Typography>
                                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.1, color: '#222', textTransform: 'capitalize' }}>{r.service_at}</Typography>
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
                            </TableContainer>
                        </Box>
                        {loading && <CircularProgress size={32} sx={{ position: 'absolute', top: 16, right: 16 }} />}
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
