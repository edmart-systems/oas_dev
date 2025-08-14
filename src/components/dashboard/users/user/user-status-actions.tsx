"use client";
import React, { Fragment, useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  CaretDown,
  CheckCircle,
  DoorOpen,
  StopCircle,
  Trash,
} from "@phosphor-icons/react/dist/ssr";
import { PopupState as PopupStateHook } from "material-ui-popup-state/hooks";
import { toast } from "react-toastify";
import {
  FullUser,
  SimpleUserDtoType,
  UserStatus,
  UserStatusAction,
  UserStatusActionType,
} from "@/types/user.types";
import { useSession } from "next-auth/react";
import { ActionResponse } from "@/types/actions-response.types";
import { useRouter } from "next/navigation";
import { paths } from "@/utils/paths.utils";
import nProgress from "nprogress";
import {
  activateUserAction,
  blockUserAction,
  deleteUserAction,
  setUserAsLeftAction,
} from "@/server-actions/user-actions/user.actions";
import ConfirmUserStatusDialog from "./confirm-user-status-dialog";
import { logger } from "@/logger/default-logger";

const MyMenuItem = styled("div")({
  padding: "6px 16px",
  // width: "200px",
});

const actions: UserStatusAction = {
  active: [
    {
      name: "block",
      label: "Block User",
      desc: "User will no-longer log into the system until activated",
      color: "error",
      icon: <StopCircle />,
    },
    {
      name: "setLeft",
      label: "Set As Left",
      desc: "Permanently disables account",
      color: "info",
      icon: <DoorOpen />,
    },
  ],
  pending: [
    {
      name: "activate",
      label: "Activate User",
      desc: "User will now be able to log into the system",
      color: "success",
      icon: <CheckCircle />,
    },
    {
      name: "delete",
      label: "Delete Account",
      desc: "Deleted account permanently",
      color: "error",
      icon: <Trash />,
    },
  ],
  blocked: [
    {
      name: "activate",
      label: "Activate User",
      desc: "User will now be able to log into the system",
      color: "success",
      icon: <CheckCircle />,
    },
    {
      name: "setLeft",
      label: "Set As Left",
      desc: "Permanently disables account",
      color: "info",
      icon: <DoorOpen />,
    },
  ],
  inactive: [
    {
      name: "activate",
      label: "Activate User",
      desc: "User will now be able to log into the system",
      color: "success",
      icon: <CheckCircle />,
    },
  ],
};

type Props = {
  user: FullUser;
};

const UserStatusActions = ({ user }: Props) => {
  const { data: sessionData } = useSession();
  const router = useRouter();

  const [isFetching, setIsFetching] = useState(false);
  const [selectedAction, setSelectedAction] =
    useState<UserStatusActionType | null>(null);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

  const isYou = sessionData
    ? sessionData.user.co_user_id === user.co_user_id
    : false;

  const handleOpenDialog = async (action: UserStatusActionType) => {
    if (isFetching) {
      return;
    }
    setSelectedAction(action);
    setConfirmationDialogOpen(true);
  };

  const closeDialogHandler = () => {
    setConfirmationDialogOpen(false);
    setSelectedAction(null);
  };

  const updateUserStatusHandler = async (
    popupState: PopupStateHook,
    reason?: string
  ) => {
    try {
      if (isFetching || !selectedAction) {
        return;
      }

      setIsFetching(true);

      let res: ActionResponse | null = null;

      switch (selectedAction) {
        case "activate":
          res = await activateUserAction(user.co_user_id);
          break;
        case "block":
          res = await blockUserAction(user.co_user_id, reason);
          break;
        case "delete":
          res = await deleteUserAction(user.co_user_id);
          break;
        case "setLeft":
          res = await setUserAsLeftAction(user.co_user_id, reason);
          break;
      }

      if (!res) {
        toast("Failed to update user status", {
          type: "error",
        });
        closeDialogHandler();
        setIsFetching(false);
        return;
      }

      if (!res.status) {
        toast(res.message, {
          type: "error",
        });
        closeDialogHandler();
        setIsFetching(false);
        return;
      }

      toast(res.message, {
        type: "success",
      });
      setIsFetching(false);
      closeDialogHandler();
      popupState && popupState.close();

      if (!res.data || selectedAction === "delete") {
        nProgress.start();
        router.push(paths.dashboard.users.main);
        return;
      }

      const updatedUser = res.data as SimpleUserDtoType;

      if (updatedUser.co_user_id !== user.co_user_id) {
        nProgress.start();
        router.replace(paths.dashboard.users.single(updatedUser.co_user_id));
        return;
      }

      nProgress.start();
      router.refresh();
      return;
    } catch (err) {
      console.log(err);
      toast("An error occurred, 10033234", {
        type: "error",
      });
    }
  };

  return (
    <PopupState variant="popover" popupId="actions-popup-menu">
      {(popupState) => {
        return (
          <Fragment>
            <Fragment>
              {selectedAction && confirmationDialogOpen && (
                <ConfirmUserStatusDialog
                  action={selectedAction}
                  isOpen={confirmationDialogOpen}
                  closeHandler={closeDialogHandler}
                  submitHandler={updateUserStatusHandler}
                  isFetching={isFetching}
                  user={user}
                  popupState={popupState}
                />
              )}
            </Fragment>
            {!isYou && (
              <Button
                variant="outlined"
                color="primary"
                endIcon={<CaretDown />}
                {...bindTrigger(popupState)}
              >
                Actions
              </Button>
            )}
            <Menu {...bindMenu(popupState)}>
              <MyMenuItem>
                <Typography>Select an action</Typography>
              </MyMenuItem>
              {actions[user.status.status as UserStatus].map((item) => {
                return (
                  <MyMenuItem key={item.name}>
                    <Button
                      variant="contained"
                      color={item.color}
                      endIcon={item.icon}
                      onClick={() => handleOpenDialog(item.name)}
                      fullWidth
                    >
                      {item.label}
                    </Button>
                  </MyMenuItem>
                );
              })}
            </Menu>
          </Fragment>
        );
      }}
    </PopupState>
  );
};

export default UserStatusActions;
