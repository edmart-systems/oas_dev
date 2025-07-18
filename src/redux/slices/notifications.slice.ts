import {
  deleteNotification as deleteNotificationHandler,
  fetchUserNotifications,
  readNotification,
} from "@/server-actions/notification-actions/notification.actions";
import {
  NotificationsCount,
  OutNotification,
} from "@/types/notification.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface NotificationsState {
  notifications: OutNotification[];
  counts: NotificationsCount;
  newAlert: boolean;
}

const initialState: NotificationsState = {
  notifications: [],
  counts: {
    total: 0,
    read: 0,
    unread: 0,
  },
  newAlert: false,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: initialState,
  reducers: {
    updateNotificationsCounts: (
      state,
      action: PayloadAction<NotificationsCount>
    ) => {
      const incoming = action.payload;
      const noChange =
        JSON.stringify({
          total: state.counts.total,
          read: state.counts.read,
          unread: state.counts.unread,
        }) ===
        JSON.stringify({
          total: incoming.total,
          read: incoming.read,
          unread: incoming.unread,
        });

      if (noChange) return;
      state.counts = incoming;
    },
    updateNotifications: (state, action: PayloadAction<OutNotification[]>) => {
      const newNotifications = action.payload;
      if (newNotifications.length > state.notifications.length) {
        state.newAlert = true;
      }
      state.notifications = newNotifications;
    },
    markNotificationAsRead: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const targetNotification = state.notifications.find(
        (item) => item.id === id
      );

      if (!targetNotification) {
        return;
      }

      if (targetNotification.isRead) {
        return;
      }

      targetNotification.isRead = true;
      state.counts.read += 1;
      state.counts.unread -= 1;
      readNotification(id);
    },
    deleteNotification: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const omitted = state.notifications.find((item) => item.id === id);

      if (!omitted) {
        return;
      }

      state.notifications = state.notifications.filter(
        (item) => item.id !== id
      );
      state.counts = {
        total: state.counts.total - 1,
        read: omitted.isRead ? state.counts.read - 1 : state.counts.read,
        unread: !omitted.isRead ? state.counts.unread - 1 : state.counts.unread,
      };

      deleteNotificationHandler(id);
    },
    resetAlertNotifications: (state) => {
      state.newAlert = false;
    },
    clearAllNotifications: (state) => {
      state = initialState;
    },
  },
});

export const {
  clearAllNotifications,
  deleteNotification,
  markNotificationAsRead,
  updateNotificationsCounts,
  updateNotifications,
  resetAlertNotifications,
} = notificationsSlice.actions;
export const notificationsReducer = notificationsSlice.reducer;
