"use client";

import React, { Fragment, useState } from "react";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { List as ListIcon } from "@phosphor-icons/react/dist/ssr/List";
import { MagnifyingGlass as MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { usePopover } from "@/hooks/use-popover";
import { MobileNav } from "./mobile-nav";
import { UserPopover } from "./user-popover";
import { stringAvatar } from "./user-avatar";
import { useSession } from "next-auth/react";
import { Avatar, Divider } from "@mui/material";
import NotificationsButton from "./notifications/notifications-button";
import ThemeButton from "./theme-button";

export const MainNav = (): JSX.Element => {
  const [openNav, setOpenNav] = useState<boolean>(false);
  const { data: sessionData } = useSession();

  const userPopover = usePopover<HTMLDivElement>();

  return (
    <Fragment>
      <Box
        component="header"
        sx={{
          borderBottom: "1px solid var(--mui-palette-divider)",
          // backgroundColor: "var(--mui-palette-background-paper)",
          backdropFilter: "blur(5px)",
          position: "sticky",
          top: 0,
          zIndex: "var(--mui-zIndex-appBar)",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: "64px",
            px: 2,
          }}
        >
          <Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
            <IconButton
              onClick={(): void => {
                setOpenNav(true);
              }}
              sx={{ display: { lg: "none" } }}
            >
              <ListIcon />
            </IconButton>
            <Tooltip title="Search">
              <IconButton>
                <MagnifyingGlassIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
            {/* <ThemeButton /> */}
            <NotificationsButton />
            <Divider variant="middle" orientation="vertical" flexItem />
            <Avatar
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              {...stringAvatar(
                sessionData
                  ? `${sessionData.user.firstName} ${sessionData.user.lastName}`
                  : "NA AN"
              )}
              src={sessionData?.user.profile_picture ?? ""}
            />
          </Stack>
        </Stack>
      </Box>
      <UserPopover
        anchorEl={userPopover.anchorRef.current}
        onClose={userPopover.handleClose}
        open={userPopover.open}
      />
      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </Fragment>
  );
};
