import { apiService } from './apiService';

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

export interface IssueSummary {
  id: string;
  projectId: string;
  referenceCode: string;
  title: string;
  type: IssueType;
  priority: IssuePriority;
  status: IssueStatus;
  isRfi: boolean;
  isBlocking: boolean;
  createdAt: string;
  updatedAt?: string;
  dueDate?: string;
  slaMinutes?: number;
  responseDueDate?: string;
  respondedAt?: string;
  assignedToUserId?: string;
  assignedToUserName?: string;
  reportedByUserId?: string;
  reportedByUserName?: string;
  respondedByUserId?: string;
  respondedByUserName?: string;
  workTaskId?: string;
  workTaskTitle?: string;
  location?: string;
  discipline?: string;
}

export interface IssueAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  contentType: string;
  fileSize: number;
  uploadedByUserId?: string;
  uploadedByUserName?: string;
  commentId?: string;
}

export interface IssueComment {
  id: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt?: string;
  authorId?: string;
  authorName?: string;
  attachments: IssueAttachment[];
}

export interface IssueLink {
  id: string;
  linkType: IssueLinkType;
  relatedEntityId?: string;
  externalReference?: string;
  label?: string;
  metadata?: string;
}

export enum IssueLinkType {
  WorkTask = 0,
  ModelElement = 1,
  Document = 2,
  Contract = 3,
  DailyLog = 4,
  Other = 5,
}

export interface IssueDetail {
  summary: IssueSummary;
  description?: string;
  resolution?: string;
  rfiQuestion?: string;
  rfiAnswer?: string;
  externalReference?: string;
  attachments: IssueAttachment[];
  comments: IssueComment[];
  links: IssueLink[];
}

export interface IssueCreateRequest {
  projectId: string;
  title: string;
  description?: string;
  type: IssueType;
  priority: IssuePriority;
  isRfi: boolean;
  isBlocking: boolean;
  dueDate?: string;
  slaMinutes?: number;
  responseDueDate?: string;
  assignedToUserId?: string;
  reportedByUserId?: string;
  workTaskId?: string;
  location?: string;
  discipline?: string;
  rfiQuestion?: string;
  externalReference?: string;
}

export interface IssueUpdateRequest {
  title: string;
  description?: string;
  type: IssueType;
  priority: IssuePriority;
  status: IssueStatus;
  isBlocking: boolean;
  dueDate?: string;
  slaMinutes?: number;
  responseDueDate?: string;
  assignedToUserId?: string;
  reportedByUserId?: string;
  respondedByUserId?: string;
  workTaskId?: string;
  location?: string;
  discipline?: string;
  resolution?: string;
  rfiQuestion?: string;
  rfiAnswer?: string;
  externalReference?: string;
}

export interface IssueAttachmentCreateRequest {
  fileName: string;
  fileUrl: string;
  contentType: string;
  fileSize: number;
  uploadedByUserId?: string;
}

export interface IssueCommentCreateRequest {
  message: string;
  isInternal: boolean;
  authorId?: string;
  attachments?: IssueAttachmentCreateRequest[];
}

export interface IssueLinkCreateRequest {
  linkType: IssueLinkType;
  relatedEntityId?: string;
  externalReference?: string;
  label?: string;
  metadata?: string;
}

export const issueService = {
  getByProject: (projectId: string, params?: { isRfi?: boolean }) => {
    const query = typeof params?.isRfi === 'boolean' ? `?isRfi=${params.isRfi}` : '';
    return apiService.get<IssueSummary[]>(`/issues/project/${projectId}${query}`);
  },

  getById: (id: string) => apiService.get<IssueDetail>(`/issues/${id}`),

  create: (payload: IssueCreateRequest) =>
    apiService.post<IssueDetail, IssueCreateRequest>('/issues', payload),

  update: (id: string, payload: IssueUpdateRequest) =>
    apiService.put<void, IssueUpdateRequest>(`/issues/${id}`, payload),

  updateStatus: (id: string, status: IssueStatus) =>
    apiService.patch<void, IssueStatus>(`/issues/${id}/status`, status),

  delete: (id: string) => apiService.delete<void>(`/issues/${id}`),

  addComment: (id: string, payload: IssueCommentCreateRequest) =>
    apiService.post<IssueComment, IssueCommentCreateRequest>(`/issues/${id}/comments`, payload),

  getComments: (id: string) => apiService.get<IssueComment[]>(`/issues/${id}/comments`),

  addLink: (id: string, payload: IssueLinkCreateRequest) =>
    apiService.post<IssueLink, IssueLinkCreateRequest>(`/issues/${id}/links`, payload),

  removeLink: (id: string, linkId: string) =>
    apiService.delete<void>(`/issues/${id}/links/${linkId}`),
};
