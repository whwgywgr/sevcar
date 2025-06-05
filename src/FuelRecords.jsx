import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNotification } from './Notification';
import { Box, Typography, Button, TextField, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, ToggleButtonGroup, ToggleButton, CircularProgress, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

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

function AnimatedDialog({ open, onClose, children, ...props }) {
    return (
        <AnimatePresence>
            {open && (
                <Dialog
                    open={open}
                    onClose={onClose}
                    PaperProps={{
                        component: motion.div,
                        initial: { opacity: 0, y: 40, scale: 0.98 },
                        animate: { opacity: 1, y: 0, scale: 1 },
                        exit: { opacity: 0, y: -40, scale: 0.98 },
                        transition: { duration: 0.28, ease: 'easeInOut' },
                        style: { overflow: 'visible' },
                    }}
                    {...props}
                >
                    {children}
                </Dialog>
            )}
        </AnimatePresence>
    );
}

// Simple in-memory cache for fetched records
const cache = {};

export default function FuelRecords({ showAdd, setShowAdd }) {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [records, setRecords] = useState([]);
    const [filter, setFilter] = useState('1m');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editId, setEditId] = useState(null);
    const [editAmount, setEditAmount] = useState('');
    const [editDate, setEditDate] = useState('');
    const [page, setPage] = useState(1);
    const [totalRows, setTotalRows] = useState(0);
    const rowsPerPage = 10;
    const notify = useNotification();

    const fetchRecords = React.useCallback(async () => {
        setLoading(true);
        setError('');
        const cacheKey = `${filter}-${page}`;
        if (cache[cacheKey]) {
            setRecords(cache[cacheKey].data);
            setTotalRows(cache[cacheKey].count);
            setLoading(false);
            return;
        }
        let query = supabase.from('fuel_records').select('*', { count: 'exact' }).order('date', { ascending: false });
        const fromDate = getDateFilter(filter);
        if (fromDate) query = query.gte('date', fromDate);
        query = query.range((page - 1) * rowsPerPage, page * rowsPerPage - 1);
        const { data, error, count } = await query;
        if (error) setError(error.message);
        else {
            setRecords(data);
            setTotalRows(count || 0);
            cache[cacheKey] = { data, count };
        }
        setLoading(false);
    }, [filter, page]);

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
        // Invalidate cache after add
        Object.keys(cache).forEach(k => { if (k.startsWith(filter)) delete cache[k]; });
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
        // Invalidate cache after edit
        Object.keys(cache).forEach(k => { if (k.startsWith(filter)) delete cache[k]; });
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
        // Invalidate cache after delete
        Object.keys(cache).forEach(k => { if (k.startsWith(filter)) delete cache[k]; });
        setLoading(false);
    };

    const total = records.reduce((sum, r) => sum + Number(r.amount), 0);

    return (
        <Box maxWidth={600} mx="auto" my={2} position="relative">
            <Typography variant="h5" fontWeight={700} mb={2}>Fuel Records</Typography>
            <AnimatedDialog open={showAdd} onClose={() => setShowAdd(false)}>
                <DialogTitle>Add Fuel Record</DialogTitle>
                <form onSubmit={handleAdd}>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Amount (RM)"
                            type="number"
                            inputProps={{ step: '0.01' }}
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            required
                            autoFocus
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
                        <Button onClick={() => setShowAdd(false)} color="secondary">Cancel</Button>
                        <Button type="submit" variant="contained" disabled={loading}>Add</Button>
                    </DialogActions>
                </form>
            </AnimatedDialog>
            <Box mb={2}>
                <ToggleButtonGroup
                    value={filter}
                    exclusive
                    onChange={(_, v) => v && setFilter(v)}
                    size="small"
                >
                    {FILTERS.map(f => (
                        <ToggleButton key={f.value} value={f.value}>{f.label}</ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Box>
            <Box mb={1} textAlign="right" fontWeight={600}>
                Total: RM {total.toFixed(2)}
            </Box>
            {error && <Box color="error.main" mb={1}>{error}</Box>}
            <TableContainer component={Paper} sx={{ mb: 7 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Amount (RM)</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {records.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ color: '#888', py: 3 }}>No records</TableCell>
                            </TableRow>
                        )}
                        {records.map(r => (
                            <TableRow key={r.id}>
                                {editId === r.id ? (
                                    <>
                                        <TableCell>
                                            <TextField type="date" value={editDate} onChange={e => setEditDate(e.target.value)} size="small" InputLabelProps={{ shrink: true }} />
                                        </TableCell>
                                        <TableCell>
                                            <TextField type="number" step="0.01" value={editAmount} onChange={e => setEditAmount(e.target.value)} size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <Button onClick={() => handleEditSave(r.id)} disabled={loading} size="small" variant="contained">Save</Button>
                                            <Button onClick={() => setEditId(null)} disabled={loading} size="small" color="secondary">Cancel</Button>
                                        </TableCell>
                                    </>
                                ) : (
                                    <>
                                        <TableCell>{r.date}</TableCell>
                                        <TableCell>RM {Number(r.amount).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleEdit(r)} size="small" color="primary"><EditIcon /></IconButton>
                                            <IconButton onClick={() => handleDelete(r.id)} disabled={loading} size="small" color="error"><DeleteIcon /></IconButton>
                                        </TableCell>
                                    </>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {/* Pagination controls */}
            {totalRows > rowsPerPage && (
                <Box display="flex" justifyContent="center" alignItems="center" mb={2} gap={2}>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    <Typography variant="body2">
                        Page {page} of {Math.ceil(totalRows / rowsPerPage)}
                    </Typography>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= Math.ceil(totalRows / rowsPerPage)}
                    >
                        Next
                    </Button>
                </Box>
            )}
            {loading && <CircularProgress size={32} sx={{ position: 'absolute', top: 16, right: 16 }} />}
        </Box>
    );
}
