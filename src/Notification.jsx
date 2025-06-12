// Simple notification system for React (no external dependencies)
import React, { useState, useCallback, createContext, useContext } from 'react';
import { Snackbar, Alert } from '@mui/material';

const NotificationContext = createContext();

// Move useNotification to its own file to comply with Fast Refresh best practices
export function useNotification() {
    return useContext(NotificationContext);
}

function NotificationManager({ notifications }) {
    return (
        <>
            {notifications.map((n) => (
                <Snackbar key={n.id} open={n.open} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                    <Alert severity={n.type} sx={{ width: '100%' }}>{n.message}</Alert>
                </Snackbar>
            ))}
        </>
    );
}

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((message, type = 'info', duration = 2500) => {
        const id = Date.now() + Math.random();
        setNotifications((prev) => [...prev, { id, message, type, open: true }]);
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, duration);
    }, []);

    return (
        <NotificationContext.Provider value={showNotification}>
            {children}
            <NotificationManager notifications={notifications} />
        </NotificationContext.Provider>
    );
}

export { NotificationContext };
