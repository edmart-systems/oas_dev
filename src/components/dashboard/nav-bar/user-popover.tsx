"use client";
import React, { Fragment, useEffect, useState } from "react";
import RouterLink from "next/link";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { GearSix as GearSixIcon } from "@phosphor-icons/react/dist/ssr/GearSix";
import { SignOut as SignOutIcon } from "@phosphor-icons/react/dist/ssr/SignOut";
import { User as UserIcon } from "@phosphor-icons/react/dist/ssr/User";
import { signOut, useSession } from "next-auth/react";
import { SessionUser } from "@/server-actions/auth-actions/auth.actions";
import LogoutDialog from "@/components/auth/logout-dialog";
import { paths } from "@/utils/paths.utils";
import { Skeleton } from "@mui/material";

import { setThemeMode } from "@/redux/slices/theme.slice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { IconButton, Tooltip } from "@mui/material";
import { MoonStars, SunDim } from "@phosphor-icons/react/dist/ssr";

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
}

export const UserPopover = ({
  anchorEl,
  onClose,
  open,
}: UserPopoverProps): JSX.Element => {
  const { status, data } = useSession();
  const [user, setUser] = useState<SessionUser>();
  const { mode } = useAppSelector((state) => state.theme);
  const dispatch = useAppDispatch();

  const router = useRouter();

  const signOutHandler = async () => {
    await signOut();
  };

  useEffect(() => {
    if (status == "loading") {
      return;
    }

    if (status == "unauthenticated") {
      signOutHandler();
      return;
    }

    if (!data) {
      return;
    }

    setUser(data.user);
  }, [data, status]);

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
      onClose={onClose}
      open={open}
      slotProps={{ paper: { sx: { width: "240px" } } }}
    >
      <Box sx={{ p: "16px 20px " }}>
        {user ? (
          <Fragment>
            <Typography variant="subtitle1">{`${user.firstName} ${user.lastName}`}</Typography>
            <Typography color="text.secondary" variant="body2">
              {user.email}
            </Typography>
          </Fragment>
        ) : (
          <Fragment>
            <Skeleton variant="rounded" height={18} />
            <Skeleton variant="rounded" height={18} />
          </Fragment>
        )}
      </Box>
      <Divider />
      <MenuList
        disablePadding
        sx={{ p: "8px", "& .MuiMenuItem-root": { borderRadius: 1 } }}
      >
        {user ? (
          <Fragment>
            <MenuItem
              component={RouterLink}
              href={paths.dashboard.settings}
              onClick={onClose}
            >
              <ListItemIcon>
                <GearSixIcon fontSize="var(--icon-fontSize-md)" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <MenuItem
              component={RouterLink}
              href={paths.dashboard.account}
              onClick={onClose}
            >
              <ListItemIcon>
                <UserIcon fontSize="var(--icon-fontSize-md)" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem
              onClick={() => {
                mode == "dark"
                  ? dispatch(setThemeMode("light"))
                  : dispatch(setThemeMode("dark"));
                onClose();
              }}
            >
              <ListItemIcon>
                {mode == "light" ? (
                  <MoonStars fontSize="var(--icon-fontSize-md)" />
                ) : (
                  <SunDim fontSize="var(--icon-fontSize-md)" />
                )}
              </ListItemIcon>
              {mode == "dark" ? "Light Theme" : "Dark Theme"}
            </MenuItem>
          </Fragment>
        ) : (
          <Fragment>
            <MenuItem onClick={onClose}>
              <ListItemIcon>
                <Skeleton variant="circular" height={30} width={30} />
              </ListItemIcon>
              <Skeleton variant="rounded" height={18} />
            </MenuItem>
            <MenuItem onClick={onClose}>
              <ListItemIcon>
                <Skeleton variant="circular" height={30} width={30} />
              </ListItemIcon>
              <Skeleton variant="rounded" height={18} />
            </MenuItem>
            <MenuItem onClick={onClose}>
              <ListItemIcon>
                <Skeleton variant="circular" height={30} width={30} />
              </ListItemIcon>
              <Skeleton variant="rounded" height={18} />
            </MenuItem>
          </Fragment>
        )}
      </MenuList>
      <Divider />
      <LogoutDialog>
        <MenuItem
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "Center",
            p: 1,
            m: 0.5,
          }}
        >
          Sign out
        </MenuItem>
      </LogoutDialog>
    </Popover>
  );
};
