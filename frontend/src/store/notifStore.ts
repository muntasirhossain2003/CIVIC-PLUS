import { create } from 'zustand';
import type { Notification } from '../types';

interface NotifState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Notification) => void;
  markAllRead: () => void;
}

export const useNotifStore = create<NotifState>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (n) =>
    set((state) => ({
      notifications: [n, ...state.notifications].slice(0, 50),
      unreadCount: state.unreadCount + 1,
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
}));
