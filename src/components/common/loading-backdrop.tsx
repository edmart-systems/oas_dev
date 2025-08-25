// src/components/common/loading-backdrop.tsx
import React, { Dispatch, SetStateAction } from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";

type Props = {
  open: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
};

const LoadingBackdrop = ({ open, setOpen }: Props) => {
  return (
    <Backdrop
      sx={(theme) => ({ 
        color: "#fff", 
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: "rgba(0, 0, 0, 0.05)"
      })}
      open={open}
      onClick={() => false}
    >
      <Box
        component="img"
        alt="Loading"
        src="/assets/Animation.gif"
        sx={{
          display: "inline-block",
          height: "auto",
          maxWidth: "100%",
          width: "auto",
        }}
      />
    </Backdrop>
  );
};

export default LoadingBackdrop;
