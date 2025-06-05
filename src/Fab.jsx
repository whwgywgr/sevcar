// Floating Action Button component
import React from 'react';
import { Fab as MuiFab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export default function Fab({ onClick, title = 'Add', icon, style = {}, ...props }) {
    return (
        <MuiFab
            color="primary"
            aria-label={title}
            title={title}
            onClick={onClick}
            sx={{ position: 'fixed', right: 24, bottom: 88, zIndex: 120, ...style }}
            {...props}
        >
            {icon || <AddIcon />}
        </MuiFab>
    );
}
