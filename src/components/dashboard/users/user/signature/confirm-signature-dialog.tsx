import React, { Dispatch, forwardRef, Ref, SetStateAction } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { Typography } from "@mui/material";
import SignatureView from "./signature-view";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  dataUrl: string;
  submitFn: () => void;
};

const ConfirmSignatureDialog = ({
  dataUrl,
  open,
  setOpen,
  submitFn,
}: Props) => {
  const handleClose = () => {
    setOpen(false);
  };

  const confirmBtnHandler = () => {
    submitFn();
    handleClose();
  };

  return (
    <Dialog
      maxWidth="sm"
      fullWidth={true}
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>Confirm Saving Signature</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to set this as your signature?
        </Typography>
      </DialogContent>
      <DialogContent>
        <SignatureView src={dataUrl} height={60} width={180} />
      </DialogContent>
      <DialogContent>
        <Typography variant="body2">
          Note, this action can not be reversed.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined" color="error">
          Cancel
        </Button>
        <Button onClick={confirmBtnHandler} variant="contained" color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmSignatureDialog;
