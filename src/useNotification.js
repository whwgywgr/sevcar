import { useContext } from 'react';
import { NotificationContext } from './Notification';

export function useNotification() {
    return useContext(NotificationContext);
}
