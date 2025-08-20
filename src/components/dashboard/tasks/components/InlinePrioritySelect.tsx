import { useState } from "react";
import { Box, Chip, Menu, MenuItem } from "@mui/material";
import {
  ArrowDropDown,
  KeyboardArrowDown,
  Remove,
  KeyboardArrowUp,
  PriorityHigh,
} from "@mui/icons-material";
import { TaskPriority } from "@/types/tasks.types";

const TASK_PRIORITIES: TaskPriority[] = ["Urgent", "High", "Moderate", "Low"];

interface InlinePrioritySelectProps {
  value: TaskPriority;
  taskId: string;
  onUpdate: (taskId: string, priority: TaskPriority) => void;
}

const priorityConfig = {
  'Low': {
    icon: <KeyboardArrowDown />,
    color: 'success' as const,
  },
  'Moderate': {
    icon: <Remove />,
    color: 'info' as const,
  },
  'High': {
    icon: <KeyboardArrowUp />,
    color: 'warning' as const,
  },
  'Urgent': {
    icon: <PriorityHigh />,
    color: 'error' as const,
  },
};

export const InlinePrioritySelect = ({ value, taskId, onUpdate }: InlinePrioritySelectProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const getConfig = (priority: TaskPriority) => {
    return priorityConfig[priority as keyof typeof priorityConfig] || { icon: <Remove />, color: 'default' as const };
  };

  return (
    <>
      <Chip
        label={
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {value}
            <ArrowDropDown sx={{ fontSize: 16 }} />
          </Box>
        }
        color={getConfig(value).color}
        icon={getConfig(value).icon}
        size="small"
        variant="outlined"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ cursor: "pointer" }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 140,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            borderRadius: 2,
          },
        }}
      >
        {TASK_PRIORITIES.map((priority) => (
          <MenuItem
            key={priority}
            onClick={() => {
              onUpdate(taskId, priority);
              setAnchorEl(null);
            }}
            sx={{ py: 1, px: 2 }}
          >
            <Chip
              label={priority}
              color={getConfig(priority).color}
              icon={getConfig(priority).icon}
              size="small"
              variant="outlined"
              sx={{ minWidth: 100 }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};