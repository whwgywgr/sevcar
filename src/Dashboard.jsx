// Dashboard.jsx - Dashboard page for fuel and maintenance summary
import React, { useEffect, useState } from 'react';
import { Box, Typography, ToggleButtonGroup, ToggleButton, Card, CardContent, CircularProgress } from '@mui/material';
import { supabase } from './supabaseClient';

const FUEL_FILTERS = [
    { label: '1 Month', value: '1m' },
    { label: '3 Months', value: '3m' },
    { label: '6 Months', value: '6m' },
    { label: '1 Year', value: '1y' },
    { label: 'All Time', value: 'all' },
];

function getDateFilter(value) {
    const now = new Date();
    if (value === '1m') now.setMonth(now.getMonth() - 1);
    else if (value === '3m') now.setMonth(now.getMonth() - 3);
    else if (value === '6m') now.setMonth(now.getMonth() - 6);
    else if (value === '1y') now.setFullYear(now.getFullYear() - 1);
    else return null;
    return now.toISOString().slice(0, 10);
}

// Simple in-memory cache for dashboard data
const dashboardCache = {};

export default function Dashboard() {
    const [fuelFilter, setFuelFilter] = useState('1m');
    const [fuelTotal, setFuelTotal] = useState(null);
    const [fuelLoading, setFuelLoading] = useState(false);
    const [maintenanceTotalYear, setMaintenanceTotalYear] = useState(null);
    const [maintenanceTotalAll, setMaintenanceTotalAll] = useState(null);
    const [maintenanceLoading, setMaintenanceLoading] = useState(false);

    useEffect(() => {
        async function fetchFuelTotal() {
            setFuelLoading(true);
            const user = (await supabase.auth.getUser()).data.user;
            const cacheKey = `fuel-${fuelFilter}-${user.id}`;
            if (dashboardCache[cacheKey]) {
                setFuelTotal(dashboardCache[cacheKey]);
                setFuelLoading(false);
                return;
            }
            let query = supabase.from('fuel_records').select('amount').eq('user_id', user.id);
            const fromDate = getDateFilter(fuelFilter);
            if (fromDate) query = query.gte('date', fromDate);
            const { data, error } = await query;
            if (error) setFuelTotal('Error');
            else {
                const total = data.reduce((sum, r) => sum + Number(r.amount), 0);
                setFuelTotal(total);
                dashboardCache[cacheKey] = total;
            }
            setFuelLoading(false);
        }
        fetchFuelTotal();
    }, [fuelFilter]);

    useEffect(() => {
        async function fetchMaintenanceTotals() {
            setMaintenanceLoading(true);
            const user = (await supabase.auth.getUser()).data.user;
            const cacheKeyYear = `maint-year-${user.id}`;
            const cacheKeyAll = `maint-all-${user.id}`;
            if (dashboardCache[cacheKeyYear] && dashboardCache[cacheKeyAll]) {
                setMaintenanceTotalYear(dashboardCache[cacheKeyYear]);
                setMaintenanceTotalAll(dashboardCache[cacheKeyAll]);
                setMaintenanceLoading(false);
                return;
            }
            // 1 year
            const fromYear = new Date();
            fromYear.setFullYear(fromYear.getFullYear() - 1);
            const fromYearStr = fromYear.toISOString().slice(0, 10);
            const { data: yearData, error: yearError } = await supabase
                .from('maintenance_records')
                .select('amount')
                .eq('user_id', user.id)
                .gte('date', fromYearStr);
            if (yearError) setMaintenanceTotalYear('Error');
            else {
                const totalYear = yearData.reduce((sum, r) => sum + Number(r.amount), 0);
                setMaintenanceTotalYear(totalYear);
                dashboardCache[cacheKeyYear] = totalYear;
            }
            // all time
            const { data: allData, error: allError } = await supabase
                .from('maintenance_records')
                .select('amount')
                .eq('user_id', user.id);
            if (allError) setMaintenanceTotalAll('Error');
            else {
                const totalAll = allData.reduce((sum, r) => sum + Number(r.amount), 0);
                setMaintenanceTotalAll(totalAll);
                dashboardCache[cacheKeyAll] = totalAll;
            }
            setMaintenanceLoading(false);
        }
        fetchMaintenanceTotals();
    }, []);

    return (
        <Box maxWidth={900} mx="auto" my={2} px={1}>
            <Typography variant="h5" fontWeight={700} mb={2} textAlign="left">Dashboard</Typography>
            <Box
                display="flex"
                flexDirection="column"
                gap={3}
                alignItems="stretch"
            >
                <Card sx={{ minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center', mb: 3 }}>
                    <CardContent>
                        <Typography variant="subtitle1" fontWeight={600} mb={1}>Total Fuel</Typography>
                        <ToggleButtonGroup
                            value={fuelFilter}
                            exclusive
                            onChange={(_, v) => v && setFuelFilter(v)}
                            size="small"
                            className="dashboard-filter-group"
                            sx={{ mb: 2 }}
                        >
                            {FUEL_FILTERS.map(f => (
                                <ToggleButton key={f.value} value={f.value}>{f.label}</ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                        <Typography variant="h6" sx={{ mt: 1 }}>
                            {fuelLoading ? <CircularProgress size={20} /> : `RM ${fuelTotal !== null ? fuelTotal.toFixed(2) : '-'}`}
                        </Typography>
                    </CardContent>
                </Card>
                <Card sx={{ minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <CardContent>
                        <Typography variant="subtitle1" fontWeight={600} mb={1}>Total Maintenance</Typography>
                        <Box display="flex" gap={3} flexDirection={{ xs: 'column', sm: 'row' }}>
                            <Box>
                                <Typography variant="body2">1 Year</Typography>
                                <Typography variant="h6">
                                    {maintenanceLoading ? <CircularProgress size={20} /> : `RM ${maintenanceTotalYear !== null ? maintenanceTotalYear.toFixed(2) : '-'}`}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2">All Time</Typography>
                                <Typography variant="h6">
                                    {maintenanceLoading ? <CircularProgress size={20} /> : `RM ${maintenanceTotalAll !== null ? maintenanceTotalAll.toFixed(2) : '-'}`}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}
