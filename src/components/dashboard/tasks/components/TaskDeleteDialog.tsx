import React, { forwardRef, Ref } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

interface TaskDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskToDelete: string | null;
  selectedCount: number;
}

export const TaskDeleteDialog: React.FC<TaskDeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  taskToDelete,
  selectedCount,
}) => {
  return (
    <Dialog
      maxWidth="md"
      fullWidth={true}
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          {taskToDelete === 'multiple' 
            ? `Are you sure you want to delete ${selectedCount} selected tasks?`
            : 'Are you sure you want to delete this task?'}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="error">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="primary"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};