import { setNotificationsDrawer } from "@/redux/slices/app.slice";
import { markNotificationAsRead } from "@/redux/slices/notifications.slice";
import { useAppDispatch } from "@/redux/store";
import { OutNotification } from "@/types/notification.types";
import { QuotationId } from "@/types/quotations.types";
import { hoverBackground } from "@/utils/styles.utils";
import { paths } from "@/utils/paths.utils";
import { fDateTime12 } from "@/utils/time.utils";
import { ExpandLess, ExpandMore, Message } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import nProgress from "nprogress";
import React, { Dispatch, SetStateAction, useMemo } from "react";

type Props = {
  notification: OutNotification;
  openedNotification: number;
  setOpenedNotification: Dispatch<SetStateAction<number>>;
  num: number;
};

const NotificationItem = ({
  notification,
  openedNotification,
  setOpenedNotification,
  num,
}: Props) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { id, time, title, message, isRead, type_id, type, action_data } =
    notification;

  const titleFormatted = title ? title : "Message";
  let actionStr: string | null = null;

  switch (type) {
    case "Quotation Followup":
      actionStr = "Open Quotation";
      break;
    default:
      actionStr = null;
      break;
  }

  const isOpen: boolean = useMemo(
    () => openedNotification === id,
    [openedNotification]
  );

  const openNotificationHandler = () => {
    if (isOpen) {
      setOpenedNotification(0);
      return;
    }
    setOpenedNotification(id);
    dispatch(markNotificationAsRead(id));
  };

  const actionClickHandler = () => {
    if (!action_data) return;

    if (type === "Quotation Followup") {
      if (action_data.includes(".")) {
        const dataArr = action_data.split(".");

        if (dataArr.length !== 2) {
          console.log("Invalid quotation notification data. " + action_data);
          return;
        }
        const quotationId: QuotationId = {
          quotationId: parseInt(dataArr[1]),
          quotationNumber: dataArr[0],
        };
        nProgress.start();
        router.push(paths.dashboard.quotations.edited(quotationId));
      } else {
        nProgress.start();
        router.push(paths.dashboard.quotations.single(action_data));
      }
      setOpenedNotification(0);
      dispatch(setNotificationsDrawer(false));
      return;
    }
  };

  return (
    <>
      <ListItemButton
        onClick={openNotificationHandler}
        sx={
          isOpen
            ? (theme) => ({
                background: hoverBackground(theme),
                "&:hover": { ".expand-notifi-btn": { display: "block" } },
              })
            : { "&:hover": { ".expand-notifi-btn": { display: "block" } } }
        }
      >
        <ListItemIcon>
          <Avatar>
            <Message />
          </Avatar>
        </ListItemIcon>
        <Stack
          direction="column"
          alignItems="flex-start"
          justifyContent="center"
          width="100%"
        >
          <Stack direction="row" alignItems="center">
            <Typography variant="body1" fontWeight={isRead ? "400" : "600"}>
              {titleFormatted}&ensp;&ensp;
            </Typography>
            {!isOpen && (
              <Typography variant="body2" fontWeight={isRead ? "400" : "600"}>
                {message.substring(0, 21)}
                {message.length > 20 && "..."}
              </Typography>
            )}
          </Stack>
          <Stack>
            <Typography variant="caption">{fDateTime12(time)}</Typography>
          </Stack>
        </Stack>
        <Box className="expand-notifi-btn" sx={{ display: "none" }}>
          {isOpen ? <ExpandLess /> : <ExpandMore />}
        </Box>
      </ListItemButton>
      {isOpen && <Divider />}
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <List
          component="div"
          sx={(theme) => ({
            background: hoverBackground(theme),
            p: 2,
          })}
        >
          <Stack
            direction="column"
            alignItems="flex-start"
            justifyContent="space-between"
            spacing={2}
          >
            <Typography variant="body1" align="justify">
              {message}
            </Typography>
            {actionStr && (
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="flex-end"
                width="100%"
              >
                <Button
                  variant="outlined"
                  size="small"
                  onClick={actionClickHandler}
                >
                  {actionStr}
                </Button>
              </Stack>
            )}
          </Stack>
        </List>
      </Collapse>
      <Divider />
    </>
  );
};

export default NotificationItem;
