import React, { forwardRef, Ref } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { Save } from "@mui/icons-material";
import { TaskStatus, TaskPriority } from "@/types/tasks.types";
import { TASK_STATUSES, TASK_PRIORITIES } from '@/components/dashboard/tasks/constants/taskConstants';

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

interface TaskMultiEditDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
  loading: boolean;
  multiEditData: {
    status?: TaskStatus;
    priority?: TaskPriority;
  };
  setMultiEditData: React.Dispatch<React.SetStateAction<{
    status?: TaskStatus;
    priority?: TaskPriority;
  }>>;
}

export const TaskMultiEditDialog: React.FC<TaskMultiEditDialogProps> = ({
  open,
  onClose,
  onConfirm,
  selectedCount,
  loading,
  multiEditData,
  setMultiEditData,
}) => {
  return (
    <Dialog
      maxWidth="md"
      fullWidth={true}
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={() => !loading && onClose()}
    >
      <DialogTitle>Edit {selectedCount} Selected Tasks</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Only fields with values will be updated. Leave blank to keep existing values.
          </Typography>
          
          <FormControl fullWidth disabled={loading}>
            <InputLabel>Status</InputLabel>
            <Select
              value={multiEditData.status || ""}
              onChange={(e) => setMultiEditData(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
              label="Status"
            >
              <MenuItem value="">Keep existing</MenuItem>
              {TASK_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth disabled={loading}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={multiEditData.priority || ""}
              onChange={(e) => setMultiEditData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
              label="Priority"
            >
              <MenuItem value="">Keep existing</MenuItem>
              {TASK_PRIORITIES.map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {priority}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined" 
          color="error"
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          disabled={loading || (!multiEditData.status && !multiEditData.priority)}
        >
          Update Tasks
        </Button>
      </DialogActions>
    </Dialog>
  );
};