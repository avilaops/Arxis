import apiService from './apiService';

export enum DocumentCategory {
  Drawing = 0,
  Specification = 1,
  Contract = 2,
  Invoice = 3,
  Photo = 4,
  Report = 5,
  Manual = 6,
  Certificate = 7,
  Permit = 8,
  Schedule = 9,
  Budget = 10,
  Email = 11,
  Other = 12,
}

export interface Document {
  id: string;
  fileName: string;
  originalFileName: string;
  fileExtension: string;
  contentType: string;
  fileSizeBytes: number;
  storagePath: string;
  description?: string;
  category: DocumentCategory;
  folderPath?: string;
  tags: string[];
  version: number;
  parentDocumentId?: string;
  projectId: string;
  workTaskId?: string;
  issueId?: string;
  uploadedByUserId: string;
  uploadedByUser?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  lastAccessedAt?: string;
  downloadCount: number;
  isArchived: boolean;
  archivedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateDocumentRequest {
  description?: string;
  category?: DocumentCategory;
  folderPath?: string;
  tags?: string[];
}

const documentService = {
  getProjectDocuments: (projectId: string, category?: DocumentCategory) => {
    const params = category !== undefined ? `?category=${category}` : '';
    return apiService.get<Document[]>(`/documents/project/${projectId}${params}`);
  },

  getDocument: (id: string) =>
    apiService.get<Document>(`/documents/${id}`),

  uploadDocument: (
    projectId: string,
    file: File,
    category: DocumentCategory,
    description?: string,
    folderPath?: string,
    workTaskId?: string,
    issueId?: string
  ) => {
    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('file', file);
    formData.append('category', category.toString());
    if (description) formData.append('description', description);
    if (folderPath) formData.append('folderPath', folderPath);
    if (workTaskId) formData.append('workTaskId', workTaskId);
    if (issueId) formData.append('issueId', issueId);

    return apiService.post<Document>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  downloadDocument: (id: string) =>
    apiService.get(`/documents/${id}/download`, { responseType: 'blob' } as any),

  updateDocument: (id: string, data: UpdateDocumentRequest) =>
    apiService.put(`/documents/${id}`, data),

  deleteDocument: (id: string, permanent = false) =>
    apiService.delete(`/documents/${id}?permanent=${permanent}`),

  uploadNewVersion: (id: string, file: File, description?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);

    return apiService.post<Document>(`/documents/${id}/version`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getDocumentVersions: (id: string) =>
    apiService.get<Document[]>(`/documents/${id}/versions`),
};

export default documentService;
