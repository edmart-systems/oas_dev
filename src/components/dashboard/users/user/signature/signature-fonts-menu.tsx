import { SignatureFontFamily, SignatureFonts } from "@/types/signature.types";
import { signatureFonts } from "@/utils/constants.utils";
import { Menu, MenuItem, Typography } from "@mui/material";
import React, { Dispatch, MouseEvent, SetStateAction, useState } from "react";
import SignatureView from "./signature-view";

type Props = {
  signTxt: string;
  setSelectedFont: Dispatch<SetStateAction<SignatureFontFamily>>;
};

const SignatureFontsMenu = ({ signTxt, setSelectedFont }: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    if (signTxt.length < 1) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlerChangeFont = (font: SignatureFontFamily) => {
    setSelectedFont(font);
    handleClose();
  };

  return (
    <div>
      <Typography
        id="signatures-button"
        variant="caption"
        color={signTxt.length < 1 ? "textDisabled" : "primary"}
        sx={{
          cursor: "pointer",
          "&:hover": { textDecoration: "underline" },
        }}
        onClick={handleOpen}
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        Change style
      </Typography>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {Object.keys(signatureFonts).map((_key, index) => {
          const key = _key as keyof SignatureFonts;
          const { fontSize, fontWeight } = signatureFonts[key];
          return (
            <MenuItem key={_key} onClick={() => handlerChangeFont(key)}>
              <SignatureView src={signTxt} isTxt height={60} fontFamily={key} />
            </MenuItem>
          );
        })}
      </Menu>
    </div>
  );
};

export default SignatureFontsMenu;
