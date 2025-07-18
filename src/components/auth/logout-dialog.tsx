import React, { forwardRef, Fragment, ReactNode, Ref, useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { signOut } from "next-auth/react";
import { SignOut } from "@phosphor-icons/react";
import { Box } from "@mui/material";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

type Props = {
  children?: ReactNode;
};

const LogoutDialog = ({ children }: Props) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const signOutHandler = async () => {
    await signOut();
  };

  const confirmBtnHandler = () => {
    signOutHandler();
    handleClose();
  };

  return (
    <Fragment>
      {children ? (
        <Box onClick={handleClickOpen}>{children}</Box>
      ) : (
        <Fragment>
          <Button
            variant="outlined"
            startIcon={<SignOut />}
            onClick={handleClickOpen}
          >
            Sign Out
          </Button>{" "}
        </Fragment>
      )}
      <Dialog
        maxWidth="md"
        fullWidth={true}
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>Confirm Signing out</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Are you sure you want to Sign out?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="error">
            Cancel
          </Button>
          <Button
            onClick={confirmBtnHandler}
            variant="contained"
            color="primary"
          >
            Sign out
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export default LogoutDialog;
