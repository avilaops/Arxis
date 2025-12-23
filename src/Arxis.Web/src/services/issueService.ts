import { apiService } from './apiService';

export interface Issue {
  id: string;
  title: string;
  description?: string;
  type: IssueType;
  priority: IssuePriority;
  status: IssueStatus;
  dueDate?: string;
  resolvedAt?: string;
  projectId: string;
  assignedToUserId?: string;
  reportedByUserId?: string;
  isRFI: boolean;
  resolution?: string;
  createdAt: string;
  updatedAt?: string;
}

export enum IssueType {
  Design = 0,
  Execution = 1,
  Safety = 2,
  Quality = 3,
  Supply = 4,
  Contract = 5,
  Other = 6,
}

export enum IssuePriority {
  P4_Low = 0,
  P3_Medium = 1,
  P2_High = 2,
  P1_Critical = 3,
}

export enum IssueStatus {
  Open = 0,
  InAnalysis = 1,
  AwaitingResponse = 2,
  Resolved = 3,
  Closed = 4,
  Cancelled = 5,
}

export const issueService = {
  getByProject: (projectId: string, isRFI?: boolean) => 
    apiService.get<Issue[]>(`/issues/project/${projectId}`, { isRFI }),
  
  getById: (id: string) => apiService.get<Issue>(`/issues/${id}`),
  
  create: (issue: Partial<Issue>) => apiService.post<Issue>('/issues', issue),
  
  update: (id: string, issue: Partial<Issue>) => 
    apiService.put<void>(`/issues/${id}`, issue),
  
  updateStatus: (id: string, status: IssueStatus) => 
    apiService.patch<void>(`/issues/${id}/status`, status),
  
  delete: (id: string) => apiService.delete<void>(`/issues/${id}`),
};
