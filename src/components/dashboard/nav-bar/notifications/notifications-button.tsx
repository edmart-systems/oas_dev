import { fetchUserNotifications } from "@/server-actions/notification-actions/notification.actions";
import { setNotificationsDrawer } from "@/redux/slices/app.slice";
import {
  resetAlertNotifications,
  updateNotifications,
} from "@/redux/slices/notifications.slice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { NotificationsActive } from "@mui/icons-material";
import { Badge, IconButton, Tooltip } from "@mui/material";
import { Bell } from "@phosphor-icons/react/dist/ssr";
import React, { useEffect } from "react";
import { toast } from "react-toastify";

const NotificationsButton = () => {
  const { counts, newAlert } = useAppSelector((state) => state.notifications);
  const dispatch = useAppDispatch();

  const openDrawerHandler = () => dispatch(setNotificationsDrawer(true));

  const fetchNotifications = async () => {
    const res = await fetchUserNotifications();

    if (!res.status || !res.data) {
      console.log("Failed to fetch notification: " + res.message);
      return;
    }

    dispatch(updateNotifications(res.data));
  };

  useEffect(() => {
    fetchNotifications();
  }, [counts]);

  useEffect(() => {
    if (newAlert) {
      toast("You have unread notification message(s)", {
        type: "info",
        onClick: () => openDrawerHandler(),
      });
      dispatch(resetAlertNotifications());
    }
  }, [newAlert]);

  return (
    <Tooltip title="Notifications">
      <IconButton size="medium" onClick={openDrawerHandler}>
        <Badge badgeContent={counts.unread} color="primary" variant="standard">
          <Bell />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default NotificationsButton;
