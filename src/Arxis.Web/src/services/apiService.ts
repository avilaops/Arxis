import env from '../config/env';

const buildApiBaseUrl = (): string => {
  const base = env.apiUrl.trim();
  if (!base) {
    return '/api';
  }

  const sanitized = base.replace(/\/$/, '');
  return sanitized.endsWith('/api') ? sanitized : `${sanitized}/api`;
};

const API_BASE_URL = buildApiBaseUrl();

// Helper para obter token do localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('arxis_token');
};

// Helper para criar headers com autenticação
const getHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // Se 401, redirecionar para login
    if (response.status === 401) {
      localStorage.removeItem('arxis_token');
      localStorage.removeItem('arxis_user');
      window.location.href = '/login';
    }

    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }

  // Verificar se há conteúdo na resposta
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

export const apiService = {
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
      ...options,
    });

    // For blob responses - handle differently
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/octet-stream')) {
      return response.blob() as any;
    }

    return handleResponse<T>(response);
  },

  async post<T, U = any>(endpoint: string, data: U, options?: RequestInit): Promise<T> {
    const isFormData = data instanceof FormData;
    const headers: any = isFormData ? {} : getHeaders();

    // Add auth token even for FormData
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: isFormData ? data : JSON.stringify(data),
      ...options,
    });
    return handleResponse<T>(response);
  },

  async put<T, U>(endpoint: string, data: U): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<T>(response);
  },

  async patch<T, U>(endpoint: string, data: U): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },
};

export default apiService;
