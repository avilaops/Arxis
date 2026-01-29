import apiService from './apiService';

export interface ProjectStatistics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  projectsByStatus: Record<string, number>;
  projectsByType: Record<string, number>;
}

export interface TaskStatistics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
}

export interface IssueStatistics {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  criticalIssues: number;
  resolutionRate: number;
  issuesByStatus: Record<string, number>;
  issuesBySeverity: Record<string, number>;
  issuesByType: Record<string, number>;
}

export interface BudgetStatistics {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  spentPercentage: number;
  projectsOverBudget: number;
  projectsUnderBudget: number;
}

export interface ProjectProgress {
  projectId: string;
  projectName: string;
  status: string;
  completionPercentage: number;
  totalTasks: number;
  completedTasks: number;
  openIssues: number;
  budget?: number;
  spent?: number;
  startDate?: string;
  endDate?: string;
  isOverdue: boolean;
}

export interface TimelineEvent {
  id: string;
  type: string;
  action: string;
  title: string;
  description: string;
  projectId?: string;
  projectName?: string;
  timestamp: string;
  userName?: string;
}

export interface DashboardOverview {
  projectStats: ProjectStatistics;
  taskStats: TaskStatistics;
  issueStats: IssueStatistics;
  budgetStats: BudgetStatistics;
  recentProjects: ProjectProgress[];
  timeline: TimelineEvent[];
}

const dashboardService = {
  getOverview: () =>
    apiService.get<DashboardOverview>('/dashboard/overview'),

  getProjectStats: () =>
    apiService.get<ProjectStatistics>('/dashboard/statistics/projects'),

  getTaskStats: () =>
    apiService.get<TaskStatistics>('/dashboard/statistics/tasks'),

  getIssueStats: () =>
    apiService.get<IssueStatistics>('/dashboard/statistics/issues'),

  getBudgetStats: () =>
    apiService.get<BudgetStatistics>('/dashboard/statistics/budget'),

  getRecentProjects: (limit = 10) =>
    apiService.get<ProjectProgress[]>(`/dashboard/projects/recent?limit=${limit}`),

  getTimeline: (limit = 20) =>
    apiService.get<TimelineEvent[]>(`/dashboard/timeline?limit=${limit}`),
};

export default dashboardService;
