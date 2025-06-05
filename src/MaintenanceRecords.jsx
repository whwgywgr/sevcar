import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNotification } from './Notification';
import { Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

// AnimatedDialog for smooth dialog transitions
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
        <Box maxWidth={600} mx="auto" my={2} position="relative">
            <Typography variant="h5" fontWeight={700} mb={2}>Maintenance Records</Typography>
            <AnimatedDialog open={showAdd} onClose={() => setShowAdd(false)}>
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
                        <Button onClick={() => setShowAdd(false)} color="secondary">Cancel</Button>
                        <Button type="submit" variant="contained" disabled={loading}>Add</Button>
                    </DialogActions>
                </form>
            </AnimatedDialog>
            <TableContainer component={Paper} sx={{ mb: 7 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Problem</TableCell>
                            <TableCell>Service Location</TableCell>
                            <TableCell>Amount (RM)</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {records.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ color: '#888', py: 3 }}>No records</TableCell>
                            </TableRow>
                        )}
                        {records.map((r) => (
                            <TableRow key={r.id}>
                                {editId === r.id ? (
                                    <>
                                        <TableCell><TextField type="date" value={editDate} onChange={e => setEditDate(e.target.value)} size="small" InputLabelProps={{ shrink: true }} /></TableCell>
                                        <TableCell><TextField value={editProblem} onChange={e => setEditProblem(e.target.value)} size="small" /></TableCell>
                                        <TableCell><TextField value={editServiceAt} onChange={e => setEditServiceAt(e.target.value)} size="small" /></TableCell>
                                        <TableCell><TextField type="number" step="0.01" value={editAmount} onChange={e => setEditAmount(e.target.value)} size="small" /></TableCell>
                                        <TableCell>
                                            <Button onClick={() => handleEditSave(r.id)} disabled={loading} size="small" variant="contained">Save</Button>
                                            <Button onClick={() => setEditId(null)} disabled={loading} size="small" color="secondary">Cancel</Button>
                                        </TableCell>
                                    </>
                                ) : (
                                    <>
                                        <TableCell>{r.date}</TableCell>
                                        <TableCell>{r.problem}</TableCell>
                                        <TableCell>{r.service_at}</TableCell>
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
            {error && <Box color="error.main" mb={1}>{error}</Box>}
            {loading && <CircularProgress size={32} sx={{ position: 'absolute', top: 16, right: 16 }} />}
        </Box>
    );
}
