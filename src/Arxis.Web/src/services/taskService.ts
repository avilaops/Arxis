import { apiService } from './apiService';

export interface WorkTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  completedAt?: string;
  projectId: string;
  assignedToUserId?: string;
  parentTaskId?: string;
  tags: string[];
  checklist: TaskChecklistItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface TaskChecklistItem {
  title: string;
  isCompleted: boolean;
}

export enum TaskStatus {
  Backlog = 0,
  Todo = 1,
  InProgress = 2,
  Blocked = 3,
  Review = 4,
  Done = 5,
  Cancelled = 6,
}

export enum TaskPriority {
  P4_Low = 0,
  P3_Medium = 1,
  P2_High = 2,
  P1_Critical = 3,
}

export const taskService = {
  getByProject: (projectId: string) => 
    apiService.get<WorkTask[]>(`/tasks/project/${projectId}`),
  
  getById: (id: string) => apiService.get<WorkTask>(`/tasks/${id}`),
  
  create: (task: Partial<WorkTask>) => apiService.post<WorkTask>('/tasks', task),
  
  update: (id: string, task: Partial<WorkTask>) => 
    apiService.put<void>(`/tasks/${id}`, task),
  
  updateStatus: (id: string, status: TaskStatus) => 
    apiService.patch<void>(`/tasks/${id}/status`, status),
  
  delete: (id: string) => apiService.delete<void>(`/tasks/${id}`),
};
