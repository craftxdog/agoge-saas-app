import { create } from "zustand";

export type AppNotification = {
  id: string;
  title: string;
  description: string;
  occurredAt: string;
  read: boolean;
  scope: "customer" | "tenant";
  category: "billing" | "schedules" | "system";
};

type NotificationState = {
  items: AppNotification[];
  addNotification: (notification: AppNotification) => void;
  markAllAsRead: () => void;
  reset: () => void;
};

const MAX_NOTIFICATIONS = 24;

export const useNotificationStore = create<NotificationState>((set) => ({
  items: [],
  addNotification: (notification) =>
    set((state) => ({
      items: [
        notification,
        ...state.items.filter((item) => item.id !== notification.id),
      ].slice(0, MAX_NOTIFICATIONS),
    })),
  markAllAsRead: () =>
    set((state) => ({
      items: state.items.map((item) => ({ ...item, read: true })),
    })),
  reset: () => set({ items: [] }),
}));
