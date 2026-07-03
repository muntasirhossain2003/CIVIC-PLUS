import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNotifStore } from '../store/notifStore';
import { notificationApi } from './api';
import { getSocket, joinUserRoom } from './socket';
import type { Notification } from '../types';

// Joins the user's private Socket.io room and keeps the unread badge in
// sync — once on mount (via the persisted count) and live as events arrive.
export function useNotificationSocket() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;

    joinUserRoom(user._id);
    notificationApi.unreadCount()
      .then((r) => useNotifStore.setState({ unreadCount: r.data.count }))
      .catch(() => {});

    const socket = getSocket();
    const handler = (n: Notification) => useNotifStore.getState().addNotification(n);
    socket.on('notification', handler);

    return () => { socket.off('notification', handler); };
  }, [user?._id]);
}
