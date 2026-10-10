import api from './api';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  admin: AdminUser;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password
    });
    return response.data;
  },

  getMe: async (): Promise<{ admin: AdminUser }> => {
    const response = await api.get<{ admin: AdminUser }>('/auth/me');
    return response.data;
  }
};

export default authService;
