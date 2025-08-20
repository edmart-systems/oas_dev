import { ApiResponse, TasksResponse, ApiTask, ApiSubTask } from "@/types/tasks.types";

export class TaskApiService {
  private baseUrl: string;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          errorData = { message: response.statusText };
        }
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async getCurrentMonthTasks(): Promise<TasksResponse> {
    const timestamp = Date.now();
    const response = await this.makeRequest<TasksResponse>(
      `/tasks?t=${timestamp}`
    );
    return response.data;
  }

  async pushPendingTasks(): Promise<string> {
    const response = await this.makeRequest<string>("/tasks/push-pending", {
      method: "POST",
    });
    return response.data;
  }

  async expireTasks(): Promise<string> {
    const response = await this.makeRequest<string>("/tasks/expire", {
      method: "POST",
    });
    return response.data;
  }

  async getTasksInRange(
    from: number,
    to: number,
    userId: number
  ): Promise<TasksResponse> {
    const response = await this.makeRequest<TasksResponse>(
      `/tasks/range?f=${from}&t=${to}`,
      {
        method: "POST",
        body: JSON.stringify({ userId }),
      }
    );
    return response.data;
  }

  async createTask(userId: number, taskData: any): Promise<ApiTask> {
    const payload = {
      userId,
      newTask: taskData,
    };

    const response = await this.makeRequest<ApiTask>("/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  }

  async updateTask(
    taskId: number,
    userId: number,
    taskData: any
  ): Promise<ApiTask> {
    const payload = {
      userId,
      taskData: {
        userId,
        taskId,
        ...taskData,
      },
    };

    const response = await this.makeRequest<ApiTask>(`/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return response.data;
  }

  async deleteTask(taskId: number, userId: number): Promise<ApiTask> {
    const response = await this.makeRequest<ApiTask>(`/tasks/${taskId}`, {
      method: "DELETE",
      body: JSON.stringify({ userId, taskId }),
    });
    return response.data;
  }

  async addSubTasks(
    taskId: number,
    userId: number,
    subTasks: any[]
  ): Promise<ApiTask> {
    const processedSubTasks = subTasks.map((st) => ({
      taskName: st.taskName,
      taskDetails: st.taskDetails || "",
      comments: st.comments || "",
      status: st.status,
      priority: st.priority || "Moderate",
      startTime: st.startTime,
      endTime: st.endTime,
      time: Date.now(),
    }));

    const payload = {
      userId,
      taskId,
      newSubTasks: processedSubTasks,
    };

    const response = await this.makeRequest<ApiTask>("/tasks/subtasks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  }

  async updateSubTask(
    subTaskId: number,
    userId: number,
    subTaskData: any
  ): Promise<ApiTask> {
    const payload = {
      userId,
      subTaskData: {
        userId,
        subTaskId,
        taskId: subTaskData.taskId,
        taskName: subTaskData.taskName,
        taskDetails: subTaskData.taskDetails || "",
        comments: subTaskData.comments || "",
        status: subTaskData.status,
        priority: subTaskData.priority,
        startTime: subTaskData.startTime,
        endTime: subTaskData.endTime,
        time: Date.now(),
      },
    };

    const response = await this.makeRequest<ApiTask>(
      `/tasks/subtasks/${subTaskId}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
    return response.data;
  }

  async deleteSubTask(
    subTaskId: number,
    userId: number,
    taskId: number
  ): Promise<ApiSubTask> {
    const response = await this.makeRequest<ApiSubTask>(
      `/tasks/subtasks/${subTaskId}`,
      {
        method: "DELETE",
        body: JSON.stringify({ userId, taskId, subTaskId }),
      }
    );
    return response.data;
  }

  async restoreTask(taskId: number, userId: number): Promise<ApiTask> {
    const response = await this.makeRequest<ApiTask>(`/tasks/${taskId}/restore`, {
      method: "POST",
      body: JSON.stringify({ userId, taskId }),
    });
    return response.data;
  }
}