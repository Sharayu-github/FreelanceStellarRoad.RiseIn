import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export interface Project {
  id: number;
  title: string;
  description: string;
  amount: string;
  deadline: string;
  status: string;
  client: string;
  freelancer?: string;
  workRef?: string;
  metaHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReputationScore {
  totalProjects: number;
  projectsAsClient: number;
  projectsAsFreelancer: number;
  successfulCompletions: number;
  successRate: number;
}

export interface CreateProjectData {
  title: string;
  description: string;
  amount: string;
  deadline: string;
  skills?: string[];
}

export interface SubmitWorkData {
  workRef: string;
  notes?: string;
}

class ApiService {
  // Projects
  async getProjects(params?: {
    status?: string;
    client?: string;
    freelancer?: string;
    limit?: number;
    offset?: number;
  }): Promise<Project[]> {
    const response = await apiClient.get('/projects', { params });
    return response.data;
  }

  async getProject(id: number): Promise<Project> {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  }

  async createProject(data: CreateProjectData): Promise<Project> {
    const response = await apiClient.post('/projects', data);
    return response.data;
  }

  async updateProjectMetadata(id: number, data: Partial<CreateProjectData>): Promise<Project> {
    const response = await apiClient.put(`/projects/${id}/metadata`, data);
    return response.data;
  }

  async submitWork(projectId: number, data: SubmitWorkData): Promise<Project> {
    const response = await apiClient.post(`/projects/${projectId}/submit`, data);
    return response.data;
  }

  // Reputation
  async getReputationScore(address: string): Promise<ReputationScore> {
    const response = await apiClient.get(`/reputation/${address}`);
    return response.data;
  }

  async getTopFreelancers(limit = 10): Promise<Array<{ address: string; score: ReputationScore }>> {
    const response = await apiClient.get('/reputation/top-freelancers', {
      params: { limit },
    });
    return response.data;
  }

  // User dashboard data
  async getDashboardData(address: string): Promise<{
    asClient: Project[];
    asFreelancer: Project[];
    reputation: ReputationScore;
  }> {
    const response = await apiClient.get(`/users/${address}/dashboard`);
    return response.data;
  }

  // Contract events
  async getProjectEvents(projectId: number): Promise<any[]> {
    const response = await apiClient.get(`/projects/${projectId}/events`);
    return response.data;
  }

  async getUserEvents(address: string): Promise<any[]> {
    const response = await apiClient.get(`/users/${address}/events`);
    return response.data;
  }

  // Statistics
  async getPlatformStats(): Promise<{
    totalProjects: number;
    totalUsers: number;
    totalVolume: string;
    successRate: number;
  }> {
    const response = await apiClient.get('/stats');
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await apiClient.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();