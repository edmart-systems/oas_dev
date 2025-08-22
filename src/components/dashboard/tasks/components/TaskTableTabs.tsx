import { Box, Tabs, Tab, IconButton } from "@mui/material";
import { Add } from "@mui/icons-material";
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

interface TaskTableTabsProps {
  statusCounts: Record<TaskStatus | "Deleted", number>;
  filteredStatusCounts: Record<TaskStatus | "Deleted", number>;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  onAddTask: () => void;
}

export const TaskTableTabs = ({
  statusCounts,
  filteredStatusCounts,
  selectedTab,
  setSelectedTab,
  onAddTask,
}: TaskTableTabsProps) => {
  return (
    <Box sx={{ 
      borderBottom: 1, 
      borderColor: "divider", 
      p: 1, 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between" 
    }}>
      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        aria-label="task status tabs"
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab
          label={`All (${Object.values(filteredStatusCounts).reduce((a, b) => a + b, 0)})`}
          value="All"
        />
        {TASK_STATUSES.map((status) => (
          <Tab
            key={status}
            label={`${status} (${filteredStatusCounts[status] || 0})`}
            value={status}
          />
        ))}
        <Tab
          key="Deleted"
          label={`Deleted (${filteredStatusCounts["Deleted"] || 0})`}
          value="Deleted"
        />
      </Tabs>
      <IconButton
        color="primary"
        onClick={onAddTask}
        size="small"
        sx={{ ml: 2 }}
      >
        <Add />
      </IconButton>
    </Box>
  );
};