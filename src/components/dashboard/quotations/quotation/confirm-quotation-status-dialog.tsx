import React, { forwardRef, Fragment, Ref } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { PopupState as PopupStateHook } from "material-ui-popup-state/hooks";
import { QuotationStatusKey } from "@/types/quotations.types";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

type Props = {
  isOpen: boolean;
  closeHandler: () => void;
  submitHandler: (popupState: PopupStateHook) => void;
  isFetching: boolean;
  status: QuotationStatusKey;
  popupState: PopupStateHook;
};

const ConfirmQuotationStatusDialog = ({
  isOpen,
  closeHandler,
  submitHandler,
  isFetching,
  status,
  popupState,
}: Props) => {
  return (
    <Fragment>
      <Dialog
        maxWidth="md"
        fullWidth={true}
        open={isOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={closeHandler}
        aria-describedby="status-confirm-dialog-slide"
      >
        <DialogTitle>Confirm Updating Quotation Status</DialogTitle>
        <DialogContent>
          <DialogContentText id="status-confirm-dialog-slide">
            {"Are you sure you want to update quotation status to " + status}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeHandler}
            variant="outlined"
            disabled={isFetching}
            color="error"
          >
            Cancel
          </Button>
          <Button
            onClick={() => submitHandler(popupState)}
            disabled={isFetching}
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

export default ConfirmQuotationStatusDialog;
