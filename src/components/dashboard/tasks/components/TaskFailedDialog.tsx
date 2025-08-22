import React, {forwardRef, Ref} from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Slide,
} from '@mui/material';
import { Warning } from '@mui/icons-material';
import { TransitionProps } from "@mui/material/transitions";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

interface TaskFailedDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskName?: string;
}

export const TaskFailedDialog: React.FC<TaskFailedDialogProps> = ({
  open,
  onClose,
  onConfirm,
  taskName,
}) => {
  return (
    <Dialog 
      maxWidth="md"      
      fullWidth={true}      
      open={open}
      TransitionComponent={Transition} 
      onClose={onClose}
      aria-describedby="alert-dialog-slide-description"      
      >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="warning" />
          <Typography variant="h6">Mark Task as Failed</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to mark "{taskName}" as Failed? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="warning">
          Mark as Failed
        </Button>
      </DialogActions>
    </Dialog>
  );
};