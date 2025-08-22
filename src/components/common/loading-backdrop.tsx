import React, { Dispatch, SetStateAction } from "react";
import Backdrop from "@mui/material/Backdrop";
import Image from "next/image";

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
      <Image
        alt="Loading"
        src="/assets/Animation.gif"
        width={150}
        height={35}
      />
    </Backdrop>
  );
};

export default LoadingBackdrop;
