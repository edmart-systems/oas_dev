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
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  confirmHandler: () => void;
  title?: string;
  body?: string;
};

const SimpleConfirmDialog = ({
  isOpen,
  confirmHandler,
  setIsOpen,
  title,
  body,
}: Props) => {
  const closeHandler = () => {
    setIsOpen(false);
  };

  const confirmClickHandler = () => {
    confirmHandler();
    closeHandler();
  };
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
        <DialogTitle>{title ? title : "Confirmation Dialog"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="status-confirm-dialog-slide">
            {body ? body : "Are you sure about this?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeHandler} variant="outlined" color="error">
            Cancel
          </Button>
          <Button
            onClick={() => confirmClickHandler()}
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

export default SimpleConfirmDialog;
