import { Chip, Tooltip } from "@mui/material";
import {
  CheckCircle,
  RemoveCircle,
  QueryBuilder,
  PlayArrow,
  HighlightOff,
  PauseCircle,
} from "@mui/icons-material";
import { TaskStatus } from "@/types/tasks.types";

interface TaskStatusChipProps {
  status: TaskStatus;
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
};

export const TaskStatusChip = ({ status }: TaskStatusChipProps) => {
  const config = statusConfig[status as keyof typeof statusConfig] || { icon: <QueryBuilder />, color: 'default' as const };
  
  return (
    <Tooltip title={`Status: ${status}`}>
      <Chip
        label={status}
        color={config.color}
        icon={config.icon}
        size="small"
        variant="outlined"
      />
    </Tooltip>
  );
};