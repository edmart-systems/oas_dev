// src/components/dashboard/tasks/components/InlineStatusSelect.tsx  

import { useState } from "react";
import { Box, Chip, Menu, MenuItem } from "@mui/material";
import {
  ArrowDropDown,
  CheckCircle,
  RemoveCircle,
  QueryBuilder,
  PlayArrow,
  HighlightOff,
  PauseCircle,
  Schedule,
  Cancel,
} from "@mui/icons-material";
import { TaskStatus } from "@/types/tasks.types";

const TASK_STATUSES: TaskStatus[] = [
  "Pending",
  "In-Progress", 
  "Stalled",
  "Failed",
  "Done",
  "Completed",
  "Pushed",
  "Cancelled",
];

interface InlineStatusSelectProps {
  value: TaskStatus;
  taskId: string;
  onUpdate: (taskId: string, status: TaskStatus) => void;
}

const statusConfig = {
  'Pending': {
    icon: <QueryBuilder />,
    color: 'warning' as const,
  },
  'In-Progress': {
    icon: <PlayArrow />,
    color: 'info' as const,
  },
  'Completed': {
    icon: <CheckCircle />,
    color: 'success' as const,
  },
  'Done': {
    icon: <CheckCircle />,
    color: 'success' as const,
  },

  'Failed': {
    icon: <HighlightOff />,
    color: 'error' as const,
  },
  'Stalled': {
    icon: <PauseCircle />,
    color: 'error' as const,
  },
  'Pushed': {
    icon: <Schedule />,
    color: 'warning' as const,
  },
  'Cancelled': {
    icon: <Cancel />,
    color: 'error' as const,
  },
};

export const InlineStatusSelect = ({ value, taskId, onUpdate }: InlineStatusSelectProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const getConfig = (status: TaskStatus) => {
    return statusConfig[status as keyof typeof statusConfig] || { icon: <QueryBuilder />, color: 'default' as const };
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
            maxWidth: 160,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            borderRadius: 2,
          },
        }}
      >
        {TASK_STATUSES.map((status) => (
          <MenuItem
            key={status}
            onClick={() => {
              onUpdate(taskId, status);
              setAnchorEl(null);
            }}
            sx={{ py: 1, px: 2 }}
          >
            <Chip
              label={status}
              color={getConfig(status).color}
              icon={getConfig(status).icon}
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