// Floating Action Button component
import React from 'react';
import { Fab as MuiFab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PropTypes from 'prop-types';

const defaultFabStyle = { position: 'fixed', right: 24, bottom: 88, zIndex: 120 };

const Fab = React.memo(function Fab({ onClick, title, icon, style, ...props }) {
    const handleClick = React.useCallback(() => onClick(), [onClick]);
    return (
        <MuiFab
            color="primary"
            aria-label={title}
            title={title}
            onClick={handleClick}
            sx={{ ...defaultFabStyle, ...style }}
            {...props}
        >
            {icon || <AddIcon />}
        </MuiFab>
    );
});

Fab.defaultProps = {
    title: 'Add',
    icon: null,
    style: {},
};

Fab.propTypes = {
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string,
    icon: PropTypes.node,
    style: PropTypes.object,
};

export default Fab;
