/**
 * Task API functions with CSRF support
 */

import { api, APIResponse } from './api-client';

// Task types
export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'inProgress' | 'done';
  status_label: string;
  is_done: boolean;
  created_at: string;
  updated_at: string;
  created_at_human: string;
  updated_at_human: string;
}

export interface TaskCreateData {
  title: string;
  description?: string;
  status?: 'pending' | 'in progress' | 'inProgress' | 'done';
}

export interface TaskUpdateData {
  title?: string;
  description?: string;
  status?: 'pending' | 'in progress' | 'inProgress' | 'done';
}

export interface TaskListResponse {
  data: Task[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number;
    to?: number;
  };
}

export interface TaskQueryParams {
  status?: 'pending' | 'inProgress' | 'done';
  search?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

/**
 * Task API client
 */
export const taskAPI = {
  /**
   * Get list of tasks
   */
  async list(params: TaskQueryParams = {}): Promise<APIResponse<TaskListResponse>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/api/tasks${queryString ? `?${queryString}` : ''}`;
    
    return api.get<TaskListResponse>(endpoint);
  },

  /**
   * Get a single task
   */
  async get(id: number): Promise<APIResponse<Task>> {
    return api.get<Task>(`/api/tasks/${id}`);
  },

  /**
   * Create a new task
   */
  async create(data: TaskCreateData): Promise<APIResponse<Task>> {
    return api.post<Task>('/api/tasks', data);
  },

  /**
   * Update an existing task
   */
  async update(id: number, data: TaskUpdateData): Promise<APIResponse<Task>> {
    return api.put<Task>(`/api/tasks/${id}`, data);
  },

  /**
   * Delete a task
   */
  async delete(id: number): Promise<APIResponse<null>> {
    return api.delete<null>(`/api/tasks/${id}`);
  },

  /**
   * Update task status specifically
   */
  async updateStatus(
    id: number, 
    status: 'pending' | 'in progress' | 'inProgress' | 'done'
  ): Promise<APIResponse<Task>> {
    return api.patch<Task>(`/api/tasks/${id}`, { status });
  },
};

/**
 * React hooks for tasks (if using React Query or SWR)
 */

// Example usage with error handling
export const taskService = {
  /**
   * Safe task creation with error handling
   */
  async createTask(data: TaskCreateData): Promise<{ task?: Task; error?: string }> {
    try {
      const response = await taskAPI.create(data);
      if (response.success) {
        return { task: response.data };
      }
      return { error: response.message };
    } catch (error: unknown) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to create task'
      };
    }
  },

  /**
   * Safe task update with error handling
   */
  async updateTask(
    id: number, 
    data: TaskUpdateData
  ): Promise<{ task?: Task; error?: string }> {
    try {
      const response = await taskAPI.update(id, data);
      if (response.success) {
        return { task: response.data };
      }
      return { error: response.message };
    } catch (error: unknown) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to update task'
      };
    }
  },

  /**
   * Safe task deletion with error handling
   */
  async deleteTask(id: number): Promise<{ success?: boolean; error?: string }> {
    try {
      const response = await taskAPI.delete(id);
      if (response.success) {
        return { success: true };
      }
      return { error: response.message };
    } catch (error: unknown) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to delete task'
      };
    }
  },

  /**
   * Safe task list fetch with error handling
   */
  async fetchTasks(
    params: TaskQueryParams = {}
  ): Promise<{ tasks?: Task[]; meta?: TaskListResponse['meta']; error?: string }> {
    try {
      const response = await taskAPI.list(params);
      if (response.success) {
        return { 
          tasks: response.data.data, 
          meta: response.data.meta 
        };
      }
      return { error: response.message };
    } catch (error: unknown) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to fetch tasks'
      };
    }
  },
};
