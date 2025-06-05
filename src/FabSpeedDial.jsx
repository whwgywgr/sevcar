// Floating Action Button with Speed Dial for Add Fuel or Maintenance
import React from 'react';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import BuildIcon from '@mui/icons-material/Build';

export default function FabSpeedDial({ onAddFuel, onAddMaintenance, ...props }) {
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
                onClick={onAddFuel}
            />
            <SpeedDialAction
                icon={<BuildIcon />}
                tooltipTitle="Add Maintenance"
                onClick={onAddMaintenance}
            />
        </SpeedDial>
    );
}
