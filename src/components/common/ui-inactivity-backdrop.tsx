"use client";

import React, { Dispatch, SetStateAction } from "react";
import Backdrop from "@mui/material/Backdrop";
import { Box, useTheme } from "@mui/material";

type Props = {
  open: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
};

const UiInActivityBackdrop = ({ open, setOpen }: Props) => {
  const theme = useTheme();
  const closeHandler = () => {
    setOpen && setOpen(false);
  };
  return (
    <Backdrop
      sx={(theme) => ({
        color: "#fff",
        zIndex: theme.zIndex.drawer + 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      })}
      open={open}
      onClick={() => closeHandler()}
      onKeyDown={() => closeHandler()}
    >
      <Box
        component="img"
        alt="sleepy-head"
        src={
          theme.palette.mode === "dark"
            ? "/assets/Sleeping_baby_dark.gif"
            : "/assets/Sleeping_baby.gif"
        }
        sx={{
          display: "inline-block",
          borderRadius: "10px",
          height: "auto",
          maxWidth: "100%",
          width: "400px",
        }}
      />
    </Backdrop>
  );
};

export default UiInActivityBackdrop;
