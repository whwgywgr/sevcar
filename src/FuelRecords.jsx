import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNotification } from './useNotification';
import { Box, Typography, Button, TextField, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, IconButton, Stack, Dialog } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import Fab from './Fab';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';

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
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editAmount, setEditAmount] = useState('');
    const [editDate, setEditDate] = useState('');
    const [page, setPage] = useState(1);
    const [totalRows, setTotalRows] = useState(0);
    const rowsPerPage = 10;
    const notify = useNotification();

    const fetchRecords = React.useCallback(async () => {
        setLoading(true);
        const user = (await supabase.auth.getUser()).data.user;
        const cacheKey = `${user.id}-all-${page}`; // filter removed from key
        if (cache[cacheKey]) {
            setRecords(cache[cacheKey].data);
            setTotalRows(cache[cacheKey].count);
            setLoading(false);
            return;
        }
        let query = supabase.from('fuel_records').select('*', { count: 'exact' }).order('date', { ascending: false });
        // No date filter
        query = query.range((page - 1) * rowsPerPage, page * rowsPerPage - 1);
        const { data, error, count } = await query;
        if (error) notify(error.message, 'error');
        else {
            setRecords(data);
            setTotalRows(count || 0);
            cache[cacheKey] = { data, count };
        }
        setLoading(false);
    }, [page, notify]); // filter removed from deps, added notify

    useEffect(() => { fetchRecords(); }, [fetchRecords]);

    useEffect(() => {
        // Subscribe to real-time changes on fuel_records
        const channel = supabase.channel('fuel_records-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'fuel_records' },
                () => {
                    fetchRecords();
                    // Invalidate cache for current user
                    Object.keys(cache).forEach(k => { if (k.startsWith('')) delete cache[k]; });
                }
            )
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [page, fetchRecords]); // filter removed from deps

    const handleAdd = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userResult = await supabase.auth.getUser();
            const user = userResult.data.user;
            if (!user) {
                notify('No user logged in', 'error');
                setLoading(false);
                return;
            }
            const { error } = await supabase.from('fuel_records').insert({
                user_id: user.id,
                amount: parseFloat(amount),
                date,
            });
            if (error) {
                notify(error.message, 'error');
            } else {
                notify('Fuel record added', 'success');
            }
            setAmount('');
            setDate('');
            fetchRecords();
            // Invalidate cache after add
            Object.keys(cache).forEach(k => { if (k.startsWith(user.id + '-all')) delete cache[k]; });
        } catch (err) {
            notify('Unexpected error: ' + err.message, 'error');
        }
        setLoading(false);
    };

    const handleEdit = (record) => {
        setEditId(record.id);
        setEditAmount(record.amount);
        setEditDate(record.date);
    };

    const handleEditSave = async (id) => {
        setLoading(true);
        const user = (await supabase.auth.getUser()).data.user;
        const { error } = await supabase.from('fuel_records').update({
            amount: parseFloat(editAmount),
            date: editDate,
        }).eq('id', id);
        if (error) {
            notify(error.message, 'error');
        } else {
            notify('Fuel record updated', 'success');
        }
        setEditId(null);
        setEditAmount('');
        setEditDate('');
        fetchRecords();
        // Invalidate cache after edit
        Object.keys(cache).forEach(k => { if (k.startsWith(user.id + '-all')) delete cache[k]; });
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this record?')) return;
        setLoading(true);
        const user = (await supabase.auth.getUser()).data.user;
        const { error } = await supabase.from('fuel_records').delete().eq('id', id);
        if (error) {
            notify(error.message, 'error');
        } else {
            notify('Fuel record deleted', 'success');
        }
        fetchRecords();
        // Invalidate cache after delete
        Object.keys(cache).forEach(k => { if (k.startsWith(user.id + '-all')) delete cache[k]; });
        setLoading(false);
    };

    const total = records.reduce((sum, r) => sum + Number(r.amount), 0);

    return (
        <Box maxWidth={600} mx="auto" my={2} position="relative">
            {/* Full width Total Card */}
            <Paper elevation={3} sx={{ mb: 2, p: 3, borderRadius: 3, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Box display="flex" alignItems="center" justifyContent="center" width="100%" gap={2}>
                    <LocalGasStationIcon sx={{ color: 'primary.main', fontSize: 40 }} />
                    <Box textAlign="left">
                        <Typography variant="h6" fontWeight={700}>Total Spent</Typography>
                        <Typography variant="h4" fontWeight={900} color="primary">RM {total.toFixed(2)}</Typography>
                    </Box>
                </Box>
            </Paper>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h5" fontWeight={700}>
                    <LocalGasStationIcon sx={{ mr: 1, color: 'primary.main', verticalAlign: 'middle' }} />
                    Fuel Records
                </Typography>
                <Box display={{ xs: 'none', sm: 'block' }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setShowAdd(true)}
                        sx={{ borderRadius: 99, fontWeight: 600 }}
                    >
                        Add
                    </Button>
                </Box>
            </Box>
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
                            helperText="Enter the amount spent on fuel."
                        />
                        <TextField
                            label="Date"
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            required
                            helperText="Select the date of refueling."
                        />
                    </DialogContent>
                    <DialogActions>
                        <Stack spacing={2} direction="row">
                            <Button onClick={() => setShowAdd(false)} color="secondary" variant="text">Cancel</Button>
                            <Button type="submit" variant="contained" disabled={loading}>Add</Button>
                        </Stack>
                    </DialogActions>
                </form>
            </AnimatedDialog>
            <Box sx={{ overflowX: 'auto', mb: 2 }}>
                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #000', borderRadius: 0 }}>
                    <Table size="small" sx={{ minWidth: 320, width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, borderBottom: '1px solid #000', background: '#fff', color: '#000' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700, borderBottom: '1px solid #000', background: '#fff', color: '#000' }}>Amount (RM)</TableCell>
                                <TableCell sx={{ fontWeight: 700, borderBottom: '1px solid #000', background: '#fff', color: '#000' }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {records.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ color: '#888', py: 3, background: '#fff', fontSize: '0.95rem' }}>No records</TableCell>
                                </TableRow>
                            )}
                            {records.map(r => (
                                <TableRow key={r.id} sx={{ background: '#fff', '&:last-child td': { borderBottom: 0 } }}>
                                    {editId === r.id ? (
                                        <>
                                            <TableCell>
                                                <TextField type="date" value={editDate} onChange={e => setEditDate(e.target.value)} size="small" InputLabelProps={{ shrink: true }} inputProps={{ style: { fontSize: '0.95rem', padding: 2, color: '#000', background: '#fff' } }} />
                                            </TableCell>
                                            <TableCell>
                                                <TextField type="number" step="0.01" value={editAmount} onChange={e => setEditAmount(e.target.value)} size="small" inputProps={{ style: { fontSize: '0.95rem', padding: 2, color: '#000', background: '#fff' } }} />
                                            </TableCell>
                                            <TableCell>
                                                <Button onClick={() => handleEditSave(r.id)} disabled={loading} size="small" variant="contained">Save</Button>
                                                <Button onClick={() => setEditId(null)} disabled={loading} size="small" color="secondary" variant="text">Cancel</Button>
                                            </TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell onClick={() => !editId && handleEdit(r)}>{r.date}</TableCell>
                                            <TableCell onClick={() => !editId && handleEdit(r)} sx={{ textAlign: 'right' }}>{Number(r.amount).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <IconButton onClick={() => handleEdit(r)} size="small" color="primary" aria-label="Edit record"><EditIcon /></IconButton>
                                                <IconButton onClick={() => handleDelete(r.id)} disabled={loading} size="small" color="error" aria-label="Delete record"><DeleteIcon /></IconButton>
                                            </TableCell>
                                        </>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            {totalRows > rowsPerPage && (
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} gap={2}>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        Showing {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, totalRows)} of {totalRows} records
                    </Typography>
                    <Stack spacing={2} direction="row">
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
                    </Stack>
                </Box>
            )}
            <Fab
                onClick={() => setShowAdd(true)}
                title="Add fuel record"
                icon={<AddIcon />}
                sx={{ display: { xs: 'flex', sm: 'none' } }}
            />
            {loading && <CircularProgress size={32} sx={{ position: 'absolute', top: 16, right: 16 }} />}
        </Box>
    );
}


