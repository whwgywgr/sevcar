// BottomNav.jsx - Responsive bottom navigation bar using Material UI
import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import BuildIcon from '@mui/icons-material/Build';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/SpaceDashboard';

const BottomNav = React.memo(function BottomNav({ active, onNavigate, onLogout }) {
    const handleChange = React.useCallback((_, newValue) => {
        if (newValue === 'logout') onLogout();
        else onNavigate(newValue);
    }, [onNavigate, onLogout]);
    return (
        <Paper sx={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 100, borderTop: 1, }} elevation={3}>
            <BottomNavigation
                showLabels={false}
                value={active}
                onChange={handleChange}
            >
                <BottomNavigationAction label="Dashboard" value="home" icon={<DashboardIcon />} />
                <BottomNavigationAction label="Fuel" value="fuel" icon={<LocalGasStationIcon />} />
                <BottomNavigationAction label="Maintenance" value="maintenance" icon={<BuildIcon />} />
                <BottomNavigationAction label="Profile" value="profile" icon={<PersonIcon />} />
                <BottomNavigationAction label="Logout" value="logout" icon={<LogoutIcon />} />
            </BottomNavigation>
        </Paper>
    );
});

export default BottomNav;
