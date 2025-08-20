import { Chip, Tooltip } from "@mui/material";
import {
  KeyboardArrowDown,
  Remove,
  KeyboardArrowUp,
  PriorityHigh,
} from "@mui/icons-material";
import { TaskPriority } from "@/types/tasks.types";

interface TaskPriorityChipProps {
  priority: TaskPriority;
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

export const TaskPriorityChip = ({ priority }: TaskPriorityChipProps) => {
  const config = priorityConfig[priority as keyof typeof priorityConfig] || { icon: <Remove />, color: 'default' as const };
  
  return (
    <Tooltip title={`Priority: ${priority}`}>
      <Chip
        label={priority}
        color={config.color}
        icon={config.icon}
        size="small"
        variant="outlined"
      />
    </Tooltip>
  );
};