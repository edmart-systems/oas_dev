import React, {
  Dispatch,
  forwardRef,
  Fragment,
  Ref,
  SetStateAction,
} from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";

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
  setExcludeVat: Dispatch<SetStateAction<boolean>>;
  vatPercentage: number;
};

const RemoveVatDialog = ({
  open,
  setOpen,
  setExcludeVat,
  vatPercentage,
}: Props) => {
  const handleClose = () => {
    setOpen(false);
  };

  const confirmBtnHandler = () => {
    setExcludeVat(true);
    handleClose();
  };

  return (
    <Fragment>
      <Dialog
        maxWidth="md"
        fullWidth={true}
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>Confirm VAT Exclusion.</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Are you sure you want to exclude the Value Added Tax (VAT) of{" "}
            {vatPercentage}%?
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
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
};

export default RemoveVatDialog;
