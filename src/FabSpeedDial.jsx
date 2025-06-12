// Floating Action Button with Speed Dial for Add Fuel or Maintenance
// (Removed from app)
import React from 'react';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import BuildIcon from '@mui/icons-material/Build';

const FabSpeedDial = React.memo(function FabSpeedDial({ onAddFuel, onAddMaintenance, ...props }) {
    const handleAddFuel = React.useCallback(() => onAddFuel(), [onAddFuel]);
    const handleAddMaintenance = React.useCallback(() => onAddMaintenance(), [onAddMaintenance]);
    return (
        <SpeedDial
            ariaLabel="Add record"
            sx={{ position: 'fixed', right: 24, bottom: 88, zIndex: 120 }}
            icon={<SpeedDialIcon />}
            {...props}
        >
            <SpeedDialAction
                icon={<LocalGasStationIcon />}
                tooltipTitle="Add Fuel"
                onClick={handleAddFuel}
            />
            <SpeedDialAction
                icon={<BuildIcon />}
                tooltipTitle="Add Maintenance"
                onClick={handleAddMaintenance}
            />
        </SpeedDial>
    );
});

export default FabSpeedDial;
