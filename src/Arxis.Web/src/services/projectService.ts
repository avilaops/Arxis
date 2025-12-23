import { apiService } from './apiService';

export interface Project {
  id: string;
  name: string;
  description?: string;
  client?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  currency: string;
  startDate?: string;
  endDate?: string;
  contractDate?: string;
  totalBudget?: number;
  status: ProjectStatus;
  type: ProjectType;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
}

export enum ProjectStatus {
  Planning = 0,
  InProgress = 1,
  OnHold = 2,
  Completed = 3,
  Archived = 4,
  Cancelled = 5,
}

export enum ProjectType {
  Residential = 0,
  Commercial = 1,
  Industrial = 2,
  Infrastructure = 3,
  Hospital = 4,
  Educational = 5,
  Other = 6,
}

export const projectService = {
  getAll: () => apiService.get<Project[]>('/projects'),
  
  getById: (id: string) => apiService.get<Project>(`/projects/${id}`),
  
  create: (project: Partial<Project>) => apiService.post<Project>('/projects', project),
  
  update: (id: string, project: Partial<Project>) => 
    apiService.put<void>(`/projects/${id}`, project),
  
  delete: (id: string) => apiService.delete<void>(`/projects/${id}`),
};
