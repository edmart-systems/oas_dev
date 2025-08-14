"use client";

import React, { useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import {
  ArrowLeft,
  ArrowRight,
  Envelope,
} from "@phosphor-icons/react/dist/ssr";
import { Tooltip } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { setNotificationsDrawer } from "@/redux/slices/app.slice";
import NotificationItem from "./notification-item";

const drawerWidth = 540;

const NotificationsDrawer = () => {
  const { notificationsBar } = useAppSelector((state) => state.app);
  const { notifications, counts } = useAppSelector(
    (state) => state.notifications
  );
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [openedNotification, setOpenedNotification] = useState<number>(0);

  const handleDrawerClose = () => {
    setOpenedNotification(0);
    dispatch(setNotificationsDrawer(false));
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        sx={{
          width: {
            xl: drawerWidth,
            lg: drawerWidth,
            md: drawerWidth,
            sm: drawerWidth,
            xs: "100vw",
          },
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: {
              xl: drawerWidth,
              lg: drawerWidth,
              md: drawerWidth,
              sm: drawerWidth,
              xs: "100vw",
            },
          },
        }}
        variant="persistent"
        anchor="right"
        open={notificationsBar}
      >
        <DrawerHeader>
          <Typography variant="h6">
            Notifications {counts.unread > 0 && `(${counts.unread})`}
          </Typography>
          <Tooltip title="Close">
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "rtl" ? <ArrowLeft /> : <ArrowRight />}
            </IconButton>
          </Tooltip>
        </DrawerHeader>
        <Divider />
        <List sx={{ maxHeight: "90vh", overflow: "scroll" }}>
          {notifications.length > 0 ? (
            notifications.map((item, index) => (
              <NotificationItem
                key={index}
                notification={item}
                num={index + 1}
                openedNotification={openedNotification}
                setOpenedNotification={setOpenedNotification}
              />
            ))
          ) : (
            <ListItem>
              <Box
                component="img"
                alt="No items"
                src="/assets/Empty.gif"
                borderRadius={2}
                sx={{
                  display: "inline-block",
                  height: "auto",
                  maxWidth: "100%",
                }}
              />
            </ListItem>
          )}
        </List>
      </Drawer>
    </Box>
  );
};

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 2),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "space-between",
}));

export default NotificationsDrawer;
