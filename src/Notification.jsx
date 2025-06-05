// Simple notification system for React (no external dependencies)
import React, { useState, useCallback, createContext, useContext } from 'react';
import { Snackbar, Alert } from '@mui/material';

const NotificationContext = createContext();

export function useNotification() {
    return useContext(NotificationContext);
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
            {notifications.map((n) => (
                <Snackbar key={n.id} open={n.open} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                    <Alert severity={n.type} sx={{ width: '100%' }}>{n.message}</Alert>
                </Snackbar>
            ))}
        </NotificationContext.Provider>
    );
}
