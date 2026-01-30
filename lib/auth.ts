import { api } from '@/lib/api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  error?: string;
  requirePasswordChange?: boolean;
  token?: string;
  user?: {
    id: number;
    companyName: string;
    contactPerson: string;
    email: string;
    username: string;
    role: string;
    isFirstLogin: boolean;
  };
  data?: {
    token: string;
    user: {
      id: number;
      companyName: string;
      contactPerson: string;
      email: string;
      username: string;
      role: string;
      isFirstLogin: boolean;
    };
  };
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  logout: async (): Promise<void> => {
    await api.get('/auth/logout');
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export const statsApi = {
  getTotalProducts: async () => {
    const response = await api.get('/admin/stats/total-products');
    return response.data;
  },
  
  getNewEstimates: async () => {
    const response = await api.get('/admin/stats/new-estimates');
    return response.data;
  }
};
