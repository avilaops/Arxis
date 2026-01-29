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

export interface TaskBoardItemResponse {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  progressPercent: number;
  squad: string;
  assignedToUserId?: string | null;
  assignedToUserName?: string | null;
  tags: string[];
  checklistTotal: number;
  checklistDone: number;
  cycleTimeHours: number;
  createdAt: string;
  completedAt?: string | null;
}

export interface TaskWorkflowStepResponse {
  id: string;
  orderIndex: number;
  name: string;
  ownerRole: string;
  slaHours: number;
  automation: boolean;
  entryCriteria: string;
  exitCriteria: string;
}

export interface TaskWorkflowResponse {
  id: string;
  name: string;
  steps: TaskWorkflowStepResponse[];
}

export interface TaskBoardResponse {
  projectId: string;
  projectName: string;
  tasks: TaskBoardItemResponse[];
  workflow: TaskWorkflowResponse;
}

export interface UpsertWorkflowStepRequest {
  id?: string | null;
  orderIndex: number;
  name: string;
  ownerRole: string;
  slaHours: number;
  automation: boolean;
  entryCriteria: string;
  exitCriteria: string;
}

export interface UpsertWorkflowRequest {
  name?: string;
  steps: UpsertWorkflowStepRequest[];
}

export const taskService = {
  getByProject: (projectId: string) =>
    apiService.get<WorkTask[]>(`/tasks/project/${projectId}`),

  getById: (id: string) => apiService.get<WorkTask>(`/tasks/${id}`),

  create: (task: Partial<WorkTask>) => apiService.post<WorkTask>('/tasks', task),

  update: (id: string, task: Partial<WorkTask>) =>
    apiService.put<void, Partial<WorkTask>>(`/tasks/${id}`, task),

  updateStatus: (id: string, status: TaskStatus) =>
    apiService.patch<void, TaskStatus>(`/tasks/${id}/status`, status),

  delete: (id: string) => apiService.delete<void>(`/tasks/${id}`),

  getBoard: (projectId: string) =>
    apiService.get<TaskBoardResponse>(`/tasks/project/${projectId}/board`),

  updateWorkflow: (projectId: string, payload: UpsertWorkflowRequest) =>
    apiService.put<TaskWorkflowResponse, UpsertWorkflowRequest>(`/tasks/project/${projectId}/workflow`, payload),

  seedDemo: (projectId: string) =>
    apiService.post<TaskBoardResponse, Record<string, never>>(`/tasks/project/${projectId}/seed-demo`, {} as Record<string, never>),
};
